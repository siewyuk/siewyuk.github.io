import {loadGLTF, loadAudio, loadVideo} from "../../mindar_libs/loader.js";
import {CSS3DObject} from '../../mindar_libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js';
import {createChromaMaterial} from "../../mindar_libs/chroma-video.js";
const THREE = window.MINDAR.IMAGE.THREE;

// photo capture canvas
const capture = (mindarThree) => {
  const {video, renderer, scene, camera} = mindarThree;
  const renderCanvas = renderer.domElement;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = renderCanvas.width;
  canvas.height = renderCanvas.height;

  const sx = (video.clientWidth - renderCanvas.clientWidth) / 2 * video.videoWidth / video.clientWidth;
  const sy = (video.clientHeight - renderCanvas.clientHeight) / 2 * video.videoHeight / video.clientHeight;
  const sw = video.videoWidth - sx * 2;
  const sh = video.videoHeight - sy * 2;

  context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  renderer.preserveDrawingBuffer = true;
  renderer.render(scene, camera);
  context.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
  renderer.preserveDrawingBuffer = false;

  // const link = document.createElement("a");
  // link.download = "ARphoto.jpeg";
  // link.href = canvas.toDataURL("image/jpeg");
  // link.click();

  const data = canvas.toDataURL("image/jpeg");
  return data;
}

document.addEventListener("DOMContentLoaded", () => {
  const start = async() => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "../../mindar_assets/targets/sarawak_demo.mind",
    });
    const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;

    // add vimeo (CSS3DObject)
    // const sarawak = new CSS3DObject(document.querySelector("#ar-div"));
    // const sarawakAnchor = mindarThree.addAnchor(0);
    // sarawakAnchor.group.add(sarawak);

    const obj = new CSS3DObject(document.querySelector("#ar-div"));
    const sarawakAnchor = mindarThree.addCSSAnchor(0);
    sarawakAnchor.group.add(obj);

    const laksaObj = new CSS3DObject(document.querySelector("#ar-div2"));
    const laksaAnchor = mindarThree.addCSSAnchor(4);
    laksaAnchor.group.add(laksaObj);

    // const laksa = new CSS3DObject(document.querySelector("#ar-div2"));
    // const laksaAnchor = mindarThree.addAnchor(4);
    // laksaAnchor.group.add(laksa);

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const hornbill = await loadGLTF('../../mindar_assets/models/rhino_hornbill/scene.gltf');
    hornbill.scene.scale.set(0.3, 0.3, 0.3);
    hornbill.scene.position.set(0, 0, 0);
    hornbill.scene.userData.clickable = true;

    const proboscis = await loadGLTF('../../mindar_assets/models/proboscis_monkey/scene.gltf');
    proboscis.scene.scale.set(0.3, 0.3, 0.3);
    proboscis.scene.position.set(0, 0, 0);
    proboscis.scene.userData.clickable = true;

    const sape = await loadGLTF('../../mindar_assets/models/sape/scene.gltf')
    sape.scene.scale.set(0.3, 0.3, 0.3);
    sape.scene.position.set(0, 0, 0);
    sape.scene.userData.clickable = true;

    // chroma
    const dayakVideo = await loadVideo("../../mindar_assets/videos/tarian_dayak.mp4");
    const dayakTexture = new THREE.VideoTexture(dayakVideo);

    const dayakGeometry = new THREE.PlaneGeometry(1, 1080/1920);
    const dayakMaterial = createChromaMaterial(dayakTexture, 0x00ff00);
    const dayakPlane = new THREE.Mesh(dayakGeometry, dayakMaterial);

    dayakPlane.rotation.x = Math.PI / 2;
    // originally = 0.7
    dayakPlane.position.y = 0.01;
    dayakPlane.scale.multiplyScalar(4);

    const nancyVideo = await loadVideo("../../mindar_assets/videos/ds_nancy.mp4");
    const nancyTexture = new THREE.VideoTexture(nancyVideo);

    const nancyGeometry = new THREE.PlaneGeometry(1, 1080/1920);
    const nancyMaterial = createChromaMaterial(nancyTexture, 0x00ff00);
    const nancyPlane = new THREE.Mesh(nancyGeometry, nancyMaterial);

    nancyPlane.rotation.x = Math.PI / 2;
    // originally = 0.7
    nancyPlane.position.y = 0.01;
    nancyPlane.scale.multiplyScalar(4);

    // anchors: 
    // Tourism Malaysia Sarawak (0)
    // Tarian Sarawak/Dayak (1)
    // Hornbill (2)
    // Proboscis (3)
    // Sarawak Laksa (4)
    // Sape (5)
    // DS Nancy ? (6/7)

    const hornbillAnchor = mindarThree.addAnchor(2);
    hornbillAnchor.group.add(hornbill.scene);

    const proboscisAnchor = mindarThree.addAnchor(3);
    proboscisAnchor.group.add(proboscis.scene);

    const sapeAnchor = mindarThree.addAnchor(5);
    sapeAnchor.group.add(sape.scene);

    const hornbillMusic = await loadAudio("../../mindar_assets/sounds/journey_awaits.mp3");

    const hornbillListener = new THREE.AudioListener();
    const hornbillAudio = new THREE.PositionalAudio(hornbillListener);

    camera.add(hornbillListener);
    hornbillAnchor.group.add(hornbillAudio);

    hornbillAudio.setRefDistance(100);
    hornbillAudio.setBuffer(hornbillMusic);
    hornbillAudio.setLoop(true);

    hornbillAnchor.onTargetFound = () => {
      hornbillAudio.play();
    }
    hornbillAnchor.onTargetLost = () => {
      hornbillAudio.pause();
    }

    // chroma anchor
    const dayakAnchor = mindarThree.addAnchor(1);
    dayakAnchor.group.add(dayakPlane);

    dayakAnchor.onTargetFound = () => {
      dayakVideo.play();
    }
    dayakAnchor.onTargetLost = () => {
      dayakVideo.pause();
    }

    const nancyAnchor = mindarThree.addAnchor(6);
    nancyAnchor.group.add(nancyPlane);

    nancyAnchor.onTargetFound = () => {
      nancyVideo.play();
    }
    nancyAnchor.onTargetLost = () => {
      nancyVideo.pause();
    }

    const proboscisMusic = await loadAudio("../../mindar_assets/sounds/monyet.mp3");

    const proboscisListener = new THREE.AudioListener();
    const proboscisAudio = new THREE.PositionalAudio(proboscisListener);

    camera.add(proboscisListener);
    proboscisAnchor.group.add(proboscisAudio);

    proboscisAudio.setRefDistance(100);
    proboscisAudio.setBuffer(proboscisMusic);
    proboscisAudio.setLoop(true);

    proboscisAnchor.onTargetFound = () => {
      proboscisAudio.play();
    }
    proboscisAnchor.onTargetLost = () => {
      proboscisAudio.pause();
    }

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

    // music starts when there's a click - error as all music are playing at once
    // document.body.addEventListener("click", (e) => {
    //   const mouseX = (e.clientX/ window.innerWidth) * 2 - 1;
    //   const mouseY = -1 * ((e.clientY/ window.innerHeight) * 2 - 1);
    //   const mouse = new THREE.Vector2(mouseX, mouseY);

    //   const raycaster = new THREE.Raycaster();
    //   raycaster.setFromCamera(mouse, camera);

    //   const intersects = raycaster.intersectObjects(scene.children, true);

    //   if (intersects.length > 0) {
    //     let o = intersects[0].object;

    //     while (o.parent && !o.userData.clickable) {
    //       o = o.parent;
    //     }

    //     if (o.userData.clickable) {
    //       if (o === hornbill.scene) {
    //         hornbillAudio.play();
    //       } else if (o === proboscis.scene) {
    //         proboscisAudio.play();
    //       } else {
    //         sapeAudio.play();
    //       }
    //     }
    //   }
    // });

    // gltf.animations
    const mixer = new THREE.AnimationMixer(hornbill.scene);
    const action = mixer.clipAction(hornbill.animations[0]);
    action.play();

    const clock = new THREE.Clock();

    // capture, preview and share
    const previewImage = document.querySelector("#preview-image");
    const previewClose = document.querySelector("#preview-close");
    const preview = document.querySelector("#preview");
    const previewShare = document.querySelector("#preview-share");

    document.querySelector("#capture").addEventListener("click", () => {
      const data = capture(mindarThree);
      preview.style.visibility = "visible";
      previewImage.src = data;
    });

    previewClose.addEventListener("click", () => {
      preview.style.visibility = "hidden";
    });

    previewShare.addEventListener("click", () => {
      const canvas = document.createElement('canvas');
      canvas.width = previewImage.width;
      canvas.height = previewImage.height;
      const context = canvas.getContext('2d');
      context.drawImage(previewImage, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
	const file = new File([blob], "ARphoto.jpeg", {type: "image/jpeg"});
	const files = [file];
	if (navigator.canShare && navigator.canShare({files})) {
	  navigator.share({
	    files: files,
	    title: 'AR Photo',
	  })
	} else {
	  const link = document.createElement('a');
	  link.download = 'ARphoto.jpeg';
	  link.href = previewImage.src;
	  link.click();
	}
      });
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      hornbill.scene.rotation.set(0, hornbill.scene.rotation.y + delta, 0);

      mixer.update(delta);
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    });
  }
  start();
  // be mindful that iOS might not work as Safari doesn't allow any audio or video
  // to be played without any user interaction (refer 013. Fix Autostart)
})