export let courseId: string;

export const setCourseId = (id: string) => {
  courseId = id;
};

export let gapiInitialized = false;

export const setGapiInitialized = (initialized: boolean) => {
  gapiInitialized = initialized;
};