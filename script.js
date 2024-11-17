/*                        th studio 
Media + Architecture Program by chifu @tku
- v1 2021.08.12 
- v2 2022.10.29
- v3 2022.12.03

************************
** THREEJS scene + GUI
************************
    Step 1 =  asynchronous loading data, preload *.glb before program processing, 
              upload data to github and donwload link via GITRAW
    Setp 2 =  correction colors output in renderer
              light settings with hemispherelight + directionlight
*/
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

// !!!!!!!!!!!  Declare  !!!!!!!!!!!
var scene, renderer;
var cam, light, geoplane;
var geometry, material, mesh;
var hemilight, dirlight; // light setting
var controls;
var vertices = [];

// declare GUI
var gui = new dat.GUI();
gui.domElement.id = 'gui'; // apply gui to DOM object

var param={
  crvt:0
}
var loader;
var modelGLTF;


// 執行
GUI();
init();
loading();
// addsubjects(); // Set up subjects
animation();

// 匯入外部 GLTF物件

function loading(){
  loader = new GLTFLoader(); // need to add THREE to load threejs extending package  
  // **** upload yout GLTF file into github and use RAWGIT for CORS download  ***
  
  loader.load( 'https://cdn.jsdelivr.net/gh/elpueblodechina/modelos/blechnacea-webp.glb',
    ( gltf )=>{
      modelGLTF = gltf.scene;
      scene.add( modelGLTF );
      // check every geometries in file
      modelGLTF.traverse( (object)=>{
          if ( object.isMesh ) {
            object.castShadow = true;
          }
      });
  } );
}

// var campts=[]

var camcrv;
// 函式
function GUI(){
  var campts=[new THREE.Vector3(1.0480614, 1.645235, 0.9939248),
            new THREE.Vector3(1.4441530, 1.5215460, -1.0456050),
            new THREE.Vector3(0.8271285, 2.0647400, -2.5431070),
            new THREE.Vector3(-1.2965222, 2.2356969, -2.0945133),
                          ]
  if (campts.length>2){
      camcrv= new THREE.CatmullRomCurve3( campts );
      console.log(camcrv.getPointAt(0))
  }
  
//   gui.add({addPt:()=>{
//     // console.log(controls.object.position)

//     // campts.push({
//     //   pt:new THREE.Vector3(controls.object.position.x,
//     //                        controls.object.position.y,
//     //                        controls.object.position.z
//     //                       )
//     // })
    
//   }},'addPt')
  
  gui.add(param,'crvt',0,1.00,0.05).onChange((v)=>{
    // if (camcrv){
    //   let ncampt = camcrv.getPointAt(v)
    //   controls.object.position.x = ncampt.x;
    //   controls.object.position.y = ncampt.y;
    //   controls.object.position.z = ncampt.z;
    //   controls.target.x = 0;
    //   controls.target.y = 0;
    //   controls.target.z = 0;
    //   controls.update()
    // }
  }).listen()
  
  document.addEventListener("wheel", (e) => {
    if (e.wheelDeltaY>0 && param.crvt<0.95){
      param.crvt+=0.05
    }else if(e.wheelDeltaY<0 && param.crvt>0.05){
      param.crvt-=0.05
    }
    if (camcrv){
      let ncampt = camcrv.getPointAt(param.crvt)
      controls.object.position.x = ncampt.x;
      controls.object.position.y = ncampt.y;
      controls.object.position.z = ncampt.z;
      controls.target.x = 0;
      controls.target.y = 0;
      controls.target.z = 0;
      controls.update()
    }
  });
}
// !!!!!!!!!!!  Initalize!  !!!!!!!!!!
//**********  Scene setting  **********  Step 2
function init() {
  // Set up SCENE
  scene = new THREE.Scene();
  //0123456789abcdef
  
  scene.background = new THREE.Color( 0xf0f0f0 );
  scene.fog = new THREE.Fog( 0xf0f0f0, 0, 50 );
  
  // Set up RENDERER
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.setAnimationLoop( animation );
  // ***************  Correction colors for loaded model  *************** 
  renderer.outputEncoding = THREE.sRGBEncoding;
  // ***************  Correction colors for loaded model  *************** END
  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize );
  
  // Set up CAMERA
  cam = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 60 );
  cam.position.z = 10;
  scene.add(cam);
  
  // Set up LIGHT
// ***************  Light Settings  *************** 
  // Set up LIGHT
  // hemilight for light up all with no shadow;
  hemilight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hemilight.position.y = 20; 
  scene.add( hemilight );
  // dirlight for casting shadow;
  dirlight = new THREE.DirectionalLight( 0xffffff );
  dirlight.position.set( - 3, 10, - 10 );
  dirlight.castShadow = true;
  dirlight.shadow.camera.top = 2;
  dirlight.shadow.camera.bottom = - 2;
  dirlight.shadow.camera.left = - 2;
  dirlight.shadow.camera.right = 2;
  dirlight.shadow.camera.near = 0.1;
  dirlight.shadow.camera.far = 40;
  scene.add( dirlight );
  // scene.add( new THREE.CameraHelper( light.shadow.camera ) ); check light position
  
  // Set up FLOOR
  geoplane = new THREE.Mesh( new THREE.PlaneGeometry( 400, 400), new THREE.MeshStandardMaterial( { color: 0xf0f0f0 } ) ); // !!! use standardMaterial to recieve shadow !!!
  geoplane.rotation.x =  - Math.PI / 2;
  geoplane.position.y = -3;
  geoplane.receiveShadow = true; //default is false
  scene.add( geoplane );
  
  // Set up CONTROLLER
  controls = new OrbitControls( cam, renderer.domElement );
  controls.minDistance = 1;
  controls.maxDistance = 5;
  controls.enableZoom=false;
  // apply adjustion
  controls.object.position.x = 1.0480614;
  controls.object.position.y = 1.645235;
  controls.object.position.z = 0.9939248;
  controls.target.x = 0;
  controls.target.y = 0;
  controls.target.z = 0;
  // remember updating!!!
  controls.update()
}
//**********  Scene setting  **********  END

//**********  GeometryHere  **********  Step 3
function addsubjects(){  
  
//   geometry = new THREE.TorusKnotGeometry( 1.5, 0.3, 100, 16 , 5 , 8 );
  
//   material = new THREE.MeshBasicMaterial( { 
//     color: 0xffff00,
//     transparent: true,
//     opacity: 0.5,
//     wireframe: true
//   } );
  
//   //mesh

//   mesh = new THREE.Mesh( geometry, material );
//   mesh.castShadow = true; //default is false
//   scene.add( mesh );
//   light.target = mesh;

}
//**********  GeometryHere  **********  END
function onWindowResize() {
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
//**********  Animation  **********  Step 4
function animation( time ) {
	// mesh.rotation.x = time * 0.001;
	// mesh.rotation.y = time / 1000;
	renderer.render( scene, cam );
} 
//**********  Animation  **********  END
