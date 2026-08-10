import * as THREE from "three";

import { OrbitControls } from
    "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

import IgnitionSwitch, {
    IGNITION_STATES
} from "./IgnitionSwitch.js";

import WiringHarness from "./WiringHarness.js";

import KeyAnimation from "./KeyAnimation.js";


/* ================================================================
   GLOBALS
   ================================================================ */

let scene;
let camera;
let renderer;
let controls;

let ignition;
let harness;
let keyAnimation;

let clock;

let stateLabel;
let electricalLabel;
let helpLabel;


/* ================================================================
   CONFIGURATION
   ================================================================ */

const CONFIG = {

    background:
        0x15181c,

    groundSize:
        180,

    cameraDistance:
        105,

    ignitionScale:
        1.0,

    showGround:
        true,

    showGrid:
        true,

    shadows:
        true

};


/* ================================================================
   INITIALIZE
   ================================================================ */

init();

animate();


/* ================================================================
   INIT
   ================================================================ */

function init() {

    clock =
        new THREE.Clock();


    /* ------------------------------------------------------------
       SCENE
       ------------------------------------------------------------ */

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            CONFIG.background
        );


    /* ------------------------------------------------------------
       CAMERA
       ------------------------------------------------------------ */

    camera =
        new THREE.PerspectiveCamera(

            45,

            window.innerWidth /
            window.innerHeight,

            0.1,

            1000

        );


    camera.position.set(

        72,
        62,
        82

    );


    camera.lookAt(

        0,
        -8,
        0

    );


    /* ------------------------------------------------------------
       RENDERER
       ------------------------------------------------------------ */

    renderer =
        new THREE.WebGLRenderer({

            antialias:
                true,

            logarithmicDepthBuffer:
                true

        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );


    renderer.shadowMap.enabled =
        CONFIG.shadows;


    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.1;


    document.body.appendChild(
        renderer.domElement
    );


    /* ------------------------------------------------------------
       ORBIT CONTROLS
       ------------------------------------------------------------ */

    controls =
        new OrbitControls(

            camera,

            renderer.domElement

        );


    controls.target.set(

        0,
        -8,
        0

    );


    controls.enableDamping =
        true;


    controls.dampingFactor =
        0.08;


    controls.minDistance =
        45;


    controls.maxDistance =
        260;


    controls.update();


    /* ------------------------------------------------------------
       LIGHTING
       ------------------------------------------------------------ */

    createLighting();


    /* ------------------------------------------------------------
       GROUND
       ------------------------------------------------------------ */

    if (
        CONFIG.showGround
    ) {

        createGround();

    }


    /* ------------------------------------------------------------
       GRID
       ------------------------------------------------------------ */

    if (
        CONFIG.showGrid
    ) {

        createGrid();

    }


    /* ------------------------------------------------------------
       IGNITION SWITCH
       ------------------------------------------------------------ */

    ignition =
        new IgnitionSwitch({

            name:
                "Automotive12VIgnition",

            barrelLength:
                43,

            barrelRadius:
                15,

            bezelRadius:
                22,

            bezelInnerRadius:
                14.2,

            rearRadius:
                17,

            rearLength:
                23,

            selectorSpeed:
                8.0

        });


    ignition.scale.setScalar(
        CONFIG.ignitionScale
    );


    /*
     * Raise the assembly slightly above the ground.
     */

    ignition.position.set(

        0,
        25,
        0

    );


    scene.add(
        ignition
    );


    /* ------------------------------------------------------------
       CREATE KEY
       ------------------------------------------------------------ */

    ignition.createKey({

        name:
            "IgnitionKey"

    });


    /* ------------------------------------------------------------
       KEY ANIMATION
       ------------------------------------------------------------ */

    keyAnimation =
        new KeyAnimation(

            ignition,

            {

                rotationSpeed:
                    7.5,

                springSpeed:
                    12.0,

                insertionSpeed:
                    8.0,

                removalSpeed:
                    8.0,

                keyInsertionDepth:
                    0,

                keyRemovalDepth:
                    18,

                enableSpringReturn:
                    true

            }

        );


    keyAnimation.onStateChanged(

        (
            current,
            previous,
            name
        ) => {

            updateStateDisplay();

        }

    );


    keyAnimation.onStart(

        () => {

            updateStateDisplay();

        }

    );


    keyAnimation.onStop(

        () => {

            updateStateDisplay();

        }

    );


    keyAnimation.onInserted(

        () => {

            updateStateDisplay();

        }

    );


    keyAnimation.onRemoved(

        () => {

            updateStateDisplay();

        }

    );


    /* ------------------------------------------------------------
       WIRING HARNESS
       ------------------------------------------------------------ */

    harness =
        new WiringHarness({

            name:
                "IgnitionHarness",

            connectorWidth:
                31,

            connectorHeight:
                20,

            connectorDepth:
                17,

            connectorY:
                -55,

            socketSpacing:
                6.6

        });


    /*
     * The switch's longitudinal axis is Y.

     * Move the harness behind the ignition switch.
     */

    harness.position.set(

        0,
        25,
        0

    );


    scene.add(
        harness
    );


    /*
     * Sync initial electrical state.
     */

    harness.applyIgnitionState(
        ignition.getElectricalState()
    );


    /* ------------------------------------------------------------
       UI
       ------------------------------------------------------------ */

    createInterface();


    /* ------------------------------------------------------------
       KEYBOARD
       ------------------------------------------------------------ */

    window.addEventListener(
        "keydown",
        onKeyDown
    );


    window.addEventListener(
        "keyup",
        onKeyUp
    );


    /* ------------------------------------------------------------
       RESIZE
       ------------------------------------------------------------ */

    window.addEventListener(
        "resize",
        onWindowResize
    );


    /* ------------------------------------------------------------
       MOUSE
       ------------------------------------------------------------ */

    renderer.domElement.addEventListener(
        "dblclick",
        onDoubleClick
    );


    updateStateDisplay();

}


/* ================================================================
   LIGHTING
   ================================================================ */

function createLighting() {

    /*
     * Ambient illumination.
     */

    const ambient =
        new THREE.HemisphereLight(

            0xdde8ff,

            0x20252b,

            2.2

        );


    scene.add(
        ambient
    );


    /*
     * Main key light.
     */

    const key =
        new THREE.DirectionalLight(

            0xffffff,

            4.0

        );


    key.position.set(

        55,
        100,
        65

    );


    key.castShadow =
        CONFIG.shadows;


    key.shadow.mapSize.set(

        2048,
        2048

    );


    key.shadow.camera.left =
        -100;

    key.shadow.camera.right =
        100;

    key.shadow.camera.top =
        100;

    key.shadow.camera.bottom =
        -100;


    scene.add(
        key
    );


    /*
     * Fill light.
     */

    const fill =
        new THREE.DirectionalLight(

            0x9db7ff,

            1.4

        );


    fill.position.set(

        -70,
        45,
        -55

    );


    scene.add(
        fill
    );


    /*
     * Small rim light.

     */

    const rim =
        new THREE.PointLight(

            0xffd9a0,

            90,

            180

        );


    rim.position.set(

        20,
        40,
        -50

    );


    scene.add(
        rim
    );

}


/* ================================================================
   GROUND
   ================================================================ */

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(

            CONFIG.groundSize,

            CONFIG.groundSize

        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x22262a,

            roughness:
                0.82,

            metalness:
                0.05

        });


    const ground =
        new THREE.Mesh(

            geometry,

            material

        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.position.y =
        -18;


    ground.receiveShadow =
        true;


    ground.name =
        "DemoGround";


    scene.add(
        ground
    );

}


/* ================================================================
   GRID
   ================================================================ */

function createGrid() {

    const grid =
        new THREE.GridHelper(

            CONFIG.groundSize,

            30,

            0x555a60,

            0x30343a

        );


    grid.position.y =
        -17.9;


    grid.name =
        "ReferenceGrid";


    scene.add(
        grid
    );

}


/* ================================================================
   UI
   ================================================================ */

function createInterface() {

    const ui =
        document.createElement(
            "div"
        );


    ui.style.position =
        "fixed";

    ui.style.left =
        "18px";

    ui.style.top =
        "18px";

    ui.style.padding =
        "14px 18px";

    ui.style.minWidth =
        "250px";

    ui.style.background =
        "rgba(10,12,15,.88)";

    ui.style.border =
        "1px solid rgba(255,255,255,.15)";

    ui.style.borderRadius =
        "8px";

    ui.style.fontFamily =
        "Arial, sans-serif";

    ui.style.fontSize =
        "13px";

    ui.style.lineHeight =
        "1.55";

    ui.style.color =
        "#e8edf2";

    ui.style.pointerEvents =
        "none";


    document.body.appendChild(
        ui
    );


    const title =
        document.createElement(
            "div"
        );


    title.textContent =
        "12V IGNITION SWITCH";


    title.style.fontWeight =
        "700";

    title.style.fontSize =
        "16px";

    title.style.marginBottom =
        "8px";


    ui.appendChild(
        title
    );


    stateLabel =
        document.createElement(
            "div"
        );


    ui.appendChild(
        stateLabel
    );


    electricalLabel =
        document.createElement(
            "div"
        );


    electricalLabel.style.marginTop =
        "6px";


    ui.appendChild(
        electricalLabel
    );


    helpLabel =
        document.createElement(
            "div"
        );


    helpLabel.style.marginTop =
        "10px";

    helpLabel.style.opacity =
        "0.7";


    helpLabel.innerHTML =
        [
            "W / ↑ : turn clockwise",
            "S / ↓ : turn counter-clockwise",
            "SPACE : hold START",
            "E : insert key",
            "Q : remove key",
            "Double-click : reset"
        ].join(
            "<br>"
        );


    ui.appendChild(
        helpLabel
    );

}


/* ================================================================
   UPDATE UI
   ================================================================ */

function updateStateDisplay() {

    if (
        !stateLabel ||
        !electricalLabel ||
        !ignition
    ) {

        return;

    }


    const state =
        keyAnimation
            ? keyAnimation.getStateName()
            : ignition.getStateName();


    stateLabel.innerHTML =
        `<strong>POSITION:</strong> ${state}`;


    const electrical =
        ignition.getElectricalState();


    electricalLabel.innerHTML =
        [
            `<strong>BAT</strong>: ${electrical.BAT ? "ON" : "OFF"}`,
            `<strong>ACC</strong>: ${electrical.ACC ? "ON" : "OFF"}`,
            `<strong>IGN</strong>: ${electrical.IGN ? "ON" : "OFF"}`,
            `<strong>ST</strong>: ${electrical.ST ? "ON" : "OFF"}`
        ].join(
            " &nbsp; "
        );


    /*
     * Update wire visualization.

     */

    if (
        harness
    ) {

        harness.applyIgnitionState(
            electrical
        );

    }

}


/* ================================================================
   KEYBOARD
   ================================================================ */

function onKeyDown(
    event
) {

    /*
     * Avoid repeatedly triggering controls when a key
     * is held by the browser.
     */

    if (
        event.repeat &&
        event.code !== "Space"
    ) {

        return;

    }


    switch (
        event.code
    ) {

        case "KeyW":

        case "ArrowUp":

            event.preventDefault();

            keyAnimation.turnClockwise();

            break;


        case "KeyS":

        case "ArrowDown":

            event.preventDefault();

            keyAnimation.turnCounterClockwise();

            break;


        case "Space":

            event.preventDefault();

            if (
                !event.repeat
            ) {

                keyAnimation.turnToStart();

            }

            break;


        case "KeyE":

            event.preventDefault();

            keyAnimation.insertKey();

            break;


        case "KeyQ":

            event.preventDefault();

            keyAnimation.removeKey();

            break;


        case "Digit0":

            event.preventDefault();

            keyAnimation.setState(
                IGNITION_STATES.OFF
            );

            break;


        case "Digit1":

            event.preventDefault();

            keyAnimation.setState(
                IGNITION_STATES.ACC
            );

            break;


        case "Digit2":

            event.preventDefault();

            keyAnimation.setState(
                IGNITION_STATES.ON
            );

            break;


        case "Digit3":

            event.preventDefault();

            keyAnimation.setState(
                IGNITION_STATES.START
            );

            break;

    }

}


/* ================================================================
   KEYBOARD RELEASE
   ================================================================ */

function onKeyUp(
    event
) {

    if (
        event.code ===
        "Space"
    ) {

        event.preventDefault();

        keyAnimation.releaseStart();

    }

}


/* ================================================================
   DOUBLE CLICK
   ================================================================ */

function onDoubleClick() {

    keyAnimation.reset();

    updateStateDisplay();

}


/* ================================================================
   WINDOW RESIZE
   ================================================================ */

function onWindowResize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );

}


/* ================================================================
   ANIMATION LOOP
   ================================================================ */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.1
        );


    /*
     * Mechanical key animation.
     */

    if (
        keyAnimation
    ) {

        keyAnimation.update(
            delta
        );

    }


    /*
     * Ignition assembly animation.

     * KeyAnimation normally controls the selector, but
     * calling update here also allows the assembly to
     * perform any internal mechanical animation.
     */

    if (
        ignition
    ) {

        ignition.update(
            delta
        );

    }


    /*
     * Wiring animation.

     */

    if (
        harness
    ) {

        harness.update(
            delta
        );

    }


    controls.update();


    /*
     * Keep electrical visualization synchronized.

     */

    updateStateDisplay();


    renderer.render(

        scene,

        camera

    );

}


/* ================================================================
   EXPOSE DEMO API
   ================================================================ */

window.ignitionDemo = {

    scene,

    camera,

    renderer,

    controls,

    ignition,

    harness,

    keyAnimation,

    setState(
        state
    ) {

        return keyAnimation.setState(
            state
        );

    },

    off() {

        return keyAnimation.setState(
            IGNITION_STATES.OFF
        );

    },

    accessory() {

        return keyAnimation.setState(
            IGNITION_STATES.ACC
        );

    },

    on() {

        return keyAnimation.setState(
            IGNITION_STATES.ON
        );

    },

    start() {

        return keyAnimation.turnToStart();

    },

    releaseStart() {

        return keyAnimation.releaseStart();

    },

    insertKey() {

        return keyAnimation.insertKey();

    },

    removeKey() {

        return keyAnimation.removeKey();

    },

    reset() {

        return keyAnimation.reset();

    }

};
