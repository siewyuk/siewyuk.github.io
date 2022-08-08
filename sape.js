import {loadGLTF, loadAudio} from "../../mindar_libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../mindar_assets/targets/sape.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const sape = await loadGLTF('../../mindar_assets/models/sape/scene.gltf');
    sape.scene.scale.set(0.3, 0.3, 0.3);
    sape.scene.position.set(0, 0, 0);
    sape.scene.userData.clickable = true;

    const sapeAnchor = mindarThree.addAnchor(0);
    sapeAnchor.group.add(sape.scene);

    const sapeMusic = await loadAudio("../../mindar_assets/sounds/lan_e.mp3");

    const sapeListener = new THREE.AudioListener();
    const sapeAudio = new THREE.PositionalAudio(sapeListener);

    camera.add(sapeListener);
    sapeAnchor.group.add(sapeAudio);

    sapeAudio.setRefDistance(100);
    sapeAudio.setBuffer(sapeMusic);
    sapeAudio.setLoop(true);

    sapeAnchor.onTargetFound = () => {
        sapeAudio.play();
    }
    sapeAnchor.onTargetLost = () => {
        sapeAudio.pause();
    }

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
    }
  start();
});
