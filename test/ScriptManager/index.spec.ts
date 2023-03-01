import ScriptManager from '../../src/ScriptManager';
import Script from '../../src/state/State/Scene/Script';
import { Vector3 } from '../../src/unit-math';

describe('ScriptManager', () => {
  describe('collision', () => {
    const scriptManager = new ScriptManager();
    scriptManager.set('test', Script.ecmaScript('test', `
      scene.addOnCollisionListener('nodeId', (otherNodeId) => {
        scene.postTestResult(otherNodeId);
      }, 'otherNodeId');
    `));

    let result: string | undefined;
    scriptManager.onPostTestResult = data => result = data as string;

    it(`should trigger the collision callback`, () => {
      result = undefined;
      scriptManager.trigger(ScriptManager.Event.collision({
        nodeId: 'nodeId',
        otherNodeId: 'otherNodeId',
        point: Vector3.ZERO_METERS
      }));
      expect(result).toEqual('otherNodeId');
    });

    it(`shouldn't trigger the collision callback`, () => {
      result = undefined;
      scriptManager.trigger(ScriptManager.Event.collision({
        nodeId: 'nodeId',
        otherNodeId: 'notOtherNodeId',
        point: Vector3.ZERO_METERS
      }));
      expect(result).toEqual(undefined);
    });
  });
  
  it('should notify on listeners', () => {
    const scriptManager = new ScriptManager();
    
    let filterIds = new Set<string>();
    scriptManager.onCollisionFiltersChanged = (nodeId, nextFilterIds) => filterIds = nextFilterIds;
    scriptManager.set('test1', Script.ecmaScript('test1', `scene.addOnCollisionListener('0', other => {}, [ '1', '2' ]);`));

    expect(filterIds).toEqual(new Set([ '1', '2' ]));

    scriptManager.set('test2', Script.ecmaScript('test2', `scene.addOnCollisionListener('0', other => {}, [ '3', '4' ]);`));

    expect(filterIds).toEqual(new Set([ '1', '2', '3', '4' ]));

    scriptManager.set('test3', Script.ecmaScript('test2', `scene.addOnCollisionListener('0', other => {}, [ '3', '4' ]);`));

    expect(filterIds).toEqual(new Set([ '1', '2', '3', '4' ]));

    scriptManager.remove('test3');

    expect(filterIds).toEqual(new Set([ '1', '2', '3', '4' ]));

    scriptManager.remove('test2');

    expect(filterIds).toEqual(new Set([ '1', '2' ]));

    scriptManager.dispose();

    expect(filterIds).toEqual(new Set());
  });
})