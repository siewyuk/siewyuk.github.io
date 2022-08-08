import {loadGLTF, loadAudio} from "../../mindar_libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../mindar_assets/targets/proboscis.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const hornbill = await loadGLTF('../../mindar_assets/models/proboscis_monkey/scene.gltf');
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

    const audioClip = await loadAudio("../../mindar_assets/sounds/monkey.mp3");
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
