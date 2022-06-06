import {loadGLTF} from "../../mindar_libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../mindar_assets/targets/sarawak3.mind',
      // Parameter below tells the engine the maximum number of targets that it
      // should track at any given time
      maxTrack: 3,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    // Load 2 models into the scene sapek_guitar & rhino_hornbill
    const sapek = await loadGLTF("../../mindar_assets/models/sapek_guitar/scene.gltf");
    // Fix model scale & position
    sapek.scene.scale.set(0.3, 0.3, 0.3);
    sapek.scene.position.set(0, -0.4, 0);

    const hornbill = await loadGLTF("../../mindar_assets/models/rhino_hornbill/scene.gltf");
    hornbill.scene.scale.set(0.3, 0.3, 0.3);
    hornbill.scene.position.set(0, -0.4, 0);

    const monkey = await loadGLTF("../../mindar_assets/models/proboscis_monkey/scene.gltf");
    monkey.scene.scale.set(0.3, 0.3, 0.3);
    monkey.scene.position.set(0, 0, 0);

    // Then create anchors
    const sapekAnchor = mindarThree.addAnchor(0);
    sapekAnchor.group.add(sapek.scene);

    // The second hornbill target image is index = 1
    const hornbillAnchor = mindarThree.addAnchor(1);
    hornbillAnchor.group.add(hornbill.scene);

    // Test add proboscis monkey index = 2
    const monkeyAnchor = mindarThree.addAnchor(2);
    monkeyAnchor.group.add(monkey.scene);


    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
