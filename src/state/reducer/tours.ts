import TourDoc from '../../tours/Tours';
import construct from '../../util/redux/construct';
import Selector from '../../db/Selector';
import db from '../../db';
import DbError from '../../db/Error';
import store from '..';
export namespace ToursAction {

  export interface TourLoading {
    type: 'tours/TOUR_LOADING';
    tourId: string;
  }

  export const tourLoading = construct<TourLoading>('tours/TOUR_LOADING');

  export interface TourLoaded {
    type: 'tours/TOUR_LOADED';
    tourId: string;
    tour: TourDoc;
  }

  export const tourLoaded = construct<TourLoaded>('tours/TOUR_LOADED');

  export interface TourError {
    type: 'tours/TOUR_ERROR';
    tourId: string;
    error: string;
  }

  export const tourError = construct<TourError>('tours/TOUR_ERROR');

  export interface TourPatch {
    type: 'tours/TOUR_PATCH';
    tourId: string;
    patch: Partial<TourDoc>;
  }

  export const tourPatch = construct<TourPatch>('tours/TOUR_PATCH');
}

export type ToursAction =
  ToursAction.TourLoading
  | ToursAction.TourLoaded
  | ToursAction.TourError
  | ToursAction.TourPatch;

export async function fetchTourIfNeeded(uid: string, tourId: string): Promise<TourDoc> {

  const state: any = store.getState();
  console.log('Checking if tour needs to be fetched state:', state, 'uid:', uid, 'tourId:', tourId);
  if (state.tours.loaded[tourId] || state.tours.loading[tourId]) {
    return state.tours.byId[tourId] ?? TourDoc.DEFAULT;
  }

  store.dispatch(ToursAction.tourLoading({ tourId }));

  try {
    const raw = await db.get<TourDoc>(Selector.userTour(tourId));
    console.log("raw:", raw);
    const tour = TourDoc.withDefaults(raw);
    //store.dispatch(ToursAction.tourLoaded({ tourId, tour }));
    const action = ToursAction.tourLoaded({ tourId, tour });
    console.log('dispatching:', action);
    store.dispatch(action);

    console.log('after dispatch -> tours slice:', store.getState().tours);
    console.log('after dispatch -> byId[tourId]:', store.getState().tours.byId?.[tourId]);
    console.log('after dispatch -> loaded[tourId]:', store.getState().tours.loaded?.[tourId]);
    return tour;
  } catch (error: any) {
    if (DbError.is(error) && error.code === DbError.CODE_NOT_FOUND) {
      console.log(`Tour with id ${tourId} not found for user ${uid}, loading default tour.`);
      store.dispatch(ToursAction.tourLoaded({ tourId, tour: TourDoc.DEFAULT }));
      return TourDoc.DEFAULT;
    }

    store.dispatch(ToursAction.tourError({ tourId, error: error?.message ?? String(error) }));
    throw error;
  }
};

export async function completeTour(storedTour: TourDoc, uid: string, tourId: string, patch?: Partial<TourDoc>): Promise<void> {
  console.log('Completing tour with storedTour:', storedTour, 'uid:', uid, 'tourId:', tourId);
  const patchData: Partial<TourDoc> = { ...storedTour, completed: true, step: undefined, updatedAt: new Date().toISOString(), ...patch };
  await db.set(Selector.userTour(tourId), patchData, true);
  store.dispatch(ToursAction.tourPatch({ tourId, patch: patchData }));
}


export type ToursState = {
  byId: Record<string, TourDoc>;
  loaded: Record<string, boolean>;
  loading: Record<string, boolean>;
  error: Record<string, string | undefined>;
};

export const reduceTours = (state: ToursState = initialToursState, action: ToursAction): ToursState => {
  switch (action.type) {
    case 'tours/TOUR_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.tourId]: true,
        },
        error: {
          ...state.error,
          [action.tourId]: undefined,
        },
      };
    case 'tours/TOUR_LOADED':
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.tourId]: action.tour,
        },
        loaded: {
          ...state.loaded,
          [action.tourId]: true,
        },
        loading: {
          ...state.loading,
          [action.tourId]: false,
        },
        error: {
          ...state.error,
          [action.tourId]: undefined,
        },
      };
    case 'tours/TOUR_ERROR':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.tourId]: false,
        },
        error: {
          ...state.error,
          [action.tourId]: action.error,
        },
      };
    case 'tours/TOUR_PATCH':
      const current = state.byId[action.tourId] ?? TourDoc.DEFAULT;
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.tourId]: TourDoc.withDefaults({ ...current, ...action.patch }),
        },
      };
    default:
      return state;
  }
};

export const initialToursState: ToursState = {
  byId: {},
  loaded: {},
  loading: {},
  error: {},
};
