import {loadGLTF, loadAudio} from "../../mindar_libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../mindar_assets/targets/hornbill.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const hornbill = await loadGLTF('../../mindar_assets/models/rhino_hornbill/scene.gltf');
    hornbill.scene.scale.set(0.3, 0.3, 0.3);
    hornbill.scene.position.set(0, 0, 0);
    hornbill.scene.userData.clickable = true;

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(hornbill.scene);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    // gltf.animations 
    const mixer = new THREE.AnimationMixer(hornbill.scene);
    // here, we're playing the first animation 
    const action = mixer.clipAction(hornbill.animations[0]);
    action.play();

    const clock = new THREE.Clock();

    // // container element here is the document body
    // document.body.addEventListener("click", (e) => {
    //   // value of X ranges from zero to the width of the container
    //   // and similar for Y
    //   // first thing to do is to normalize these coordinates   
    //   // specifically, we want the value to go from -1 to 1 instead
    //   // when dealing with canvas, DOM coordinate system, Y-axis goes from top to bottom 
    //   // whereas in canvas, it goes from bottom to top 
    //   // therefore, we need to reverse the Y coordinate by multiplying it by -1
    //   const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    //   const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
    //   // then create a vector object to combine the 2
    //   const mouse = new THREE.Vector2(mouseX, mouseY);

    //   const raycaster = new THREE.Raycaster();
    //   raycaster.setFromCamera(mouse, camera);
    //   // this raycast object requires the mouse position to be in a normalized scale -1 to 1
      
    //   // the list of parameters are the objects we're interest in
    //   // second parameter is whether we should check recursively for all the decendants
    //   // this method will return a list of intersects 
    //   // and likely return all the objects for the whole hierarchy
    //   // the return of these two intersect objects are sorted by the distance
    //   // from the camera, where we're interested in the closest among those,
    //   // which is intersect[0]
    //   // but usually, we want to check all the objects in the scene 
    //   // the second parameter is whether we should check recursively for all the decendant,
    //   // which in this case, obviously it's true
    //   const intersects = raycaster.intersectObjects(scene.children, true);

    //   // to ensure it intersects with 1 object, we'll wrap it in a condition 
    //   if (intersects.length > 0) {
    //     // we need to recursively go up the hierarchy through the parent and check
    //     // whether any of them is indeed the object, using a while loop 
    //     let o = intersects[0].object;

    //     while (o.parent && !o.userData.clickable) {
    //       o = o.parent;
    //     }
    //     if (o.userData.clickable) {
    //       if (o === raccoon.scene) {
    //         audio.play();
    //       }
    //     }
    //   }
    // });

    const audioClip = await loadAudio("../../mindar_assets/sounds/Sarawak_A_Journey_Awaits.mp3");
    const audio = new THREE.Audio(listener);
    audio.setBuffer(audioClip);

    document.body.addEventListener("click", (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
      const mouse = new THREE.Vector2(mouseX, mouseY);

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
	let o = intersects[0].object;

	while (o.parent && !o.userData.clickable) {
	  o = o.parent;
	}

	if (o.userData.clickable) {
	  if (o === hornbill.scene) {
	    audio.play();
	  }
	}
      }
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      
      const delta = clock.getDelta();

      hornbill.scene.rotation.set(0, hornbill.scene.rotation.y + delta, 0);

      mixer.update(delta);
      
      renderer.render(scene, camera);
    });
  }
  start();
});


// Unfortunately, THREE.js objects are just virtual elements inside the canvas.
// They're not DOM Element by themselves, so we're unable to simply do something
// to the object 
// Instead, we'll need to capture the click event on the canvas container and 
// do some calculation with that position ourselves 

// How do we use this coordinate to calculate whether the users actually touching
// on the object that we're interested? 
// In 3D libraries, including THREE.js, 
// One common technique is raycasting, the idea is that we try to fire a virtual way
// from the camera to the point on the screen and beyond and check whether this way
// intersects with any objects along the way
