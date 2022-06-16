import {loadGLTF, loadVideo} from "../../mindar_libs/loader.js";
//import {mockWithVideo} from '../../libs/camera-mock';
import {createChromaMaterial} from "../../mindar_libs/chroma-video.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    //mockWithVideo('../../mindar_assets/mock-videos/course-banner1.mp4');
    
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../mindar_assets/targets/Tarian_Dayak.mind',
    });
    const {renderer, scene, camera} = mindarThree;

    const video = await loadVideo("../../mindar_assets/videos/Tarian_Dayak.mp4");
    const texture = new THREE.VideoTexture(video);

    const geometry = new THREE.PlaneGeometry(1, 1080/1920);
    // here, in MeshBasicMaterial we're already using some kind of default shader
    // default shader it's simple that we are more or less just put everything in
    // the texture into the output canvas
    // const material = new THREE.MeshBasicMaterial({map: texture});
    // create material with createChromaMaterial function, which takes texture as
    // first parameter and the Chroma key as the second, which is just a color that
    // we'll treat as transparent
    const material = createChromaMaterial(texture, 0x00ff00);
    const plane = new THREE.Mesh(geometry, material);

    // Don't want the video to overlay the image, but want to align it it 
    // perpendicular to the image target, like the object is standing upright
    // on the target 
    plane.rotation.x = Math.PI / 2;
    // originally = 0.7
    plane.position.y = 0.01;
    plane.scale.multiplyScalar(4);
    

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(plane);

    anchor.onTargetFound = () => {
      video.play();
    }
    anchor.onTargetLost = () => {
      video.pause();
    }

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});

// There's no simple configuration to remove green screen, so we need to 
// go deeper down into the rendering pipeline 
// Specifically, it involves something we call shaders 
// For simplicity, shaders is a little program that dictates how the objects 
// are being rendered to the output canvas 

// Idea of green screen removal is that, whenever we encounter a pixel that is green
// or close enough to enough to green, we will make that pixel transparent
// To do that, we need to write a custom shader program instead of using the standard one 
// Unfortunately, the shader program is written with a special language called GLSL,
// instead of JS
// The shader program can be a totally standalone course by itself 
