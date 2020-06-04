import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Sim {
  public main () {
    const canvas = document.getElementById('sim') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({canvas});
  
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-33, 100, 5);
  
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(-37, 0, -2);
    controls.update();
  
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('LightGrey');
  
    {
      const planeLength = 120;
      const planeWidth = 60;
  
      const loader = new THREE.TextureLoader();
      const texture = loader.load('static/Surface-A.png');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
    //   const repeats = planeSize / 2;
    //   texture.repeat.set(repeats, repeats);
  
      const planeGeo = new THREE.PlaneBufferGeometry(planeLength, planeWidth);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.rotation.x = Math.PI * -.5;
      scene.add(mesh);
    }
  
    {
      const skyColor = 0xB1E1FF;  // light blue
      const groundColor = 0xB97A20;  // brownish orange
      const intensity = 0.5;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      scene.add(light);
    }
  
    {
      const color = 0xFFFFFF;
      const intensity = 0.5;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(5, 10, 2);
      scene.add(light);
      scene.add(light.target);
    }
  
    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
      // const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
      const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
      const distance = sizeToFitOnScreen / Math.tan(halfFovY);
      // compute a unit vector that points in the direction the camera is now
      // in the xz plane from the center of the box
      const direction = (new THREE.Vector3())
          .subVectors(camera.position, boxCenter)
          .multiply(new THREE.Vector3(0, 0.3, 0.9))
          .normalize();
  
      // move the camera to a position distance units way from the center
      // in whatever direction the camera was from the center already
      camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  
      // pick some near and far values for the frustum that
      // will contain the box.
      camera.near = boxSize / 100;
      camera.far = boxSize * 100;
      
      camera.updateProjectionMatrix();
  
      // point the camera to look at the center of the box
      camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
    }

    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
      const localPrefix = isLast ? '└─' : '├─';
      lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
      const newPrefix = prefix + (isLast ? '  ' : '│ ');
      const lastNdx = obj.children.length - 1;
      obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
      });
      return lines;
    }

    let wheels;
    {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load('static/Simulator_Demobot_Cleared.glb', (gltf) => {
        const root = gltf.scene;
        scene.add(root);

        wheels = root.getObjectByName('Servo_Wheel-1');
        console.log(wheels);
        console.log(dumpObject(root).join('\n'))
        //console.log(root.children[0].children[0].children[0].children[0].children);

  
        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);
  
        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());
  
        // set the camera to frame the box
        frameArea(boxSize * 0.5, boxSize, boxCenter, camera);
        gltf.scene.scale.set(1,1,1); // scale here
        gltf.scene.position.set(-37,0,-2);
        gltf.scene.rotateY(Math.PI/2);
        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
      });
    }
  
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
  
    function render(time) {
        time *= 0.001;
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (wheels) {
        for (const wheel of wheels.children) {
          wheel.rotation.y = time;
        }
      }
  
      renderer.render(scene, camera);
  
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);
  }

}