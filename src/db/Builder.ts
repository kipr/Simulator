import Dict from '../Dict';
import store, { State } from '../state';
import { ChallengeCompletionsAction, ChallengesAction, ScenesAction } from '../state/reducer';
import Async from '../state/State/Async';
import { AsyncChallenge } from '../state/State/Challenge';
import { AsyncChallengeCompletion } from '../state/State/ChallengeCompletion';
import { AsyncScene } from '../state/State/Scene';

export class ChallengeBuilder {
  private id_: string;
  private builder_: Builder;

  private challenge_: AsyncChallenge;

  constructor(id: string, builder: Builder) {
    this.id_ = id;
    this.builder_ = builder;

    this.challenge_ = builder.state.challenges[id];

    if (!this.challenge_ || this.challenge_.type === Async.Type.Unloaded) {
      builder.loadChallenge_(id);
    } else {
      builder.addChallenge_(id, this.challenge_);
    }
  }

  scene(): SceneBuilder {
    const latest = Async.latestValue(this.challenge_);
    if (!latest) return new SceneBuilder(undefined, this.builder_);
    
    return new SceneBuilder(latest.sceneId, this.builder_);
  }

  completion(): ChallengeCompletionBuilder {
    return new ChallengeCompletionBuilder(this.id_, this.builder_);
  }
}

export class ChallengeCompletionBuilder {
  constructor(id: string | undefined, builder: Builder) {
    if (!id) return;

    const challengeCompletion = builder.state.challengeCompletions[id];
  
    if (!challengeCompletion || challengeCompletion.type === Async.Type.Unloaded) {
      builder.loadChallengeCompletion_(id);
    } else {
      builder.addChallengeCompletion_(id, challengeCompletion);
    }
  }
}

export class SceneBuilder {
  constructor(id: string | undefined, builder: Builder) {
    if (!id) return;

    const scene = builder.state.scenes[id];
  
    if (!scene || scene.type === Async.Type.Unloaded) {
      builder.loadScene_(id);
    } else {
      builder.addScene_(id, scene);
    }
  }
}

class Builder {
  private state_: State;
  get state() { return this.state_; }

  private scenes_: Dict<AsyncScene> = {};
  get scenes() { return this.scenes_; }

  private scenesToLoad_: Set<string> = new Set();

  private challenges_: Dict<AsyncChallenge> = {};
  get challenges() { return this.challenges_; }

  private challengesToLoad_: Set<string> = new Set();

  private challengeCompletions_: Dict<AsyncChallengeCompletion> = {};
  get challengeCompletions() { return this.challengeCompletions_; }

  private challengeCompletionsToLoad_: Set<string> = new Set();

  constructor(state: State) {
    this.state_ = state;
  }

  challenge(id: string): ChallengeBuilder {
    return new ChallengeBuilder(id, this);
  }

  scene(id: string): SceneBuilder {
    return new SceneBuilder(id, this);
  }

  addScene_(id: string, scene: AsyncScene) {
    this.scenes_[id] = scene;
  }

  addChallenge_(id: string, challenge: AsyncChallenge) {
    this.challenges_[id] = challenge;
  }

  addChallengeCompletion_(id: string, challengeCompletion: AsyncChallengeCompletion) {
    this.challengeCompletions_[id] = challengeCompletion;
  }

  loadScene_(id: string) {
    this.scenesToLoad_.add(id);
    this.scenes_[id] = Async.unloaded({});
  }

  loadChallenge_(id: string) {
    this.challengesToLoad_.add(id);
    this.challenges_[id] = Async.unloaded({});
  }

  loadChallengeCompletion_(id: string) {
    this.challengeCompletionsToLoad_.add(id);
    this.challengeCompletions_[id] = Async.unloaded({});
  }
  
  dispatchLoads() {
    for (const sceneId of this.scenesToLoad_) {
      store.dispatch(ScenesAction.loadScene({ sceneId }));
    }
    for (const challengeId of this.challengesToLoad_) {
      store.dispatch(ChallengesAction.loadChallenge({ challengeId }));
    }
    for (const challengeId of this.challengeCompletionsToLoad_) {
      store.dispatch(ChallengeCompletionsAction.loadChallengeCompletion({ challengeId }));
    }
  }
}

export default Builder;