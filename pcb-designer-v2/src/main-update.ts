<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>PCB Designer</title>
    <style>
      body { margin: 0; overflow: hidden; background: #111; }
    </style>
  </head>
  <body>
    <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
      }
    }
    </script>
    <script type="module">
    import * as THREE from "https://esm.sh/three@0.160.0";
    import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";
    import { TransformControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/TransformControls.js";
    import {
      computeBoundsTree,
      disposeBoundsTree,
      acceleratedRaycast
    } from "https://esm.sh/three-mesh-bvh@0.7.4";
    import GUI from "https://esm.sh/lil-gui@0.18.2";
    /* === BVH SETUP === */
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
    /* === SCENE SETUP === */
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
    camera.position.set(0,100,100)
    
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(innerWidth, innerHeight)
    document.body.appendChild(renderer.domElement)
    
    const light = new THREE.HemisphereLight(0xffffff,0x444444,1)
    scene.add(light)
  </body>
</html>
