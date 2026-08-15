/* ==========================================================
    draftComponentPlacement.js
    Ghost / Transparent Component Placement System

    Features
    ----------------------------------------------------------
    ✓ Semi-transparent "ghost" preview mesh
    ✓ Grid snapping
    ✓ Footprint pad snapping
    ✓ Component rotation
    ✓ Placement validation
    ✓ Collision testing
    ✓ 2D + 3D support
    ✓ Color feedback (valid/invalid)
    ✓ Library integration
========================================================== */

import * as THREE from "https://esm.sh/three@0.165.0";

export class DraftComponentPlacement {

    constructor(editor) {

        this.editor = editor;

        this.enabled = false;

        this.currentComponent = null;

        this.ghost = null;

        this.rotation = 0;

        this.snapEnabled = true;

        this.gridSize = 1;

        this.isValidPlacement = false;

        this.pointer = new THREE.Vector2();

        this.raycaster = new THREE.Raycaster();

        this.mouseWorld = new THREE.Vector3();

        this.validMaterial =
            new THREE.MeshStandardMaterial({

                transparent: true,
                opacity: 0.45,

                color: 0x00ff00
            });

        this.invalidMaterial =
            new THREE.MeshStandardMaterial({

                transparent: true,
                opacity: 0.45,

                color: 0xff0000
            });
    }

    /* ======================================================
        Begin placement
    ====================================================== */

    begin(componentDefinition) {

        this.cancel();

        this.enabled = true;

        this.currentComponent = componentDefinition;

        this.ghost =
            this.createGhostMesh(componentDefinition);

        this.editor.scene.add(this.ghost);
    }

    /* ======================================================
        Build transparent preview mesh
    ====================================================== */

    createGhostMesh(componentDefinition) {

        let mesh;

        if (componentDefinition.mesh) {

            mesh = componentDefinition.mesh.clone();

        } else {

            mesh =
                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        componentDefinition.width || 4,
                        componentDefinition.height || 1,
                        componentDefinition.depth || 2
                    )
                );
        }

        mesh.traverse(child => {

            if (child.isMesh) {

                child.material =
                    this.validMaterial.clone();
            }
        });

        return mesh;
    }

    /* ======================================================
        Mouse update
    ====================================================== */

    updatePointer(event) {

        const rect =
            this.editor.renderer.domElement
                .getBoundingClientRect();

        this.pointer.x =
            ((event.clientX - rect.left) /
                rect.width) *
                2 -
            1;

        this.pointer.y =
            -(
                (event.clientY - rect.top) /
                rect.height
            ) *
                2 +
            1;
    }

    /* ======================================================
        Convert screen -> board coordinates
    ====================================================== */

    updatePlacement() {

        if (!this.enabled || !this.ghost)
            return;

        this.raycaster.setFromCamera(

            this.pointer,

            this.editor.camera
        );

        const hits =
            this.raycaster.intersectObject(

                this.editor.boardMesh
            );

        if (!hits.length)
            return;

        const p = hits[0].point.clone();

        if (this.snapEnabled) {

            this.applyGridSnap(p);

            this.applyPadSnap(p);
        }

        this.ghost.position.copy(p);

        this.ghost.rotation.y = this.rotation;

        this.isValidPlacement =
            this.validatePlacement();

        this.updateGhostMaterial();
    }

    /* ======================================================
        Grid snap
    ====================================================== */

    applyGridSnap(position) {

        position.x =
            Math.round(

                position.x /
                    this.gridSize
            ) *
            this.gridSize;

        position.z =
            Math.round(

                position.z /
                    this.gridSize
            ) *
            this.gridSize;
    }

    /* ======================================================
        Snap to nearest footprint pad
    ====================================================== */

    applyPadSnap(position) {

        let nearest = null;

        let distance = Infinity;

        for (const pad of this.editor.pads) {

            const d =
                position.distanceTo(
                    pad.position
                );

            if (d < distance && d < 2) {

                distance = d;

                nearest = pad;
            }
        }

        if (nearest) {

            position.copy(nearest.position);
        }
    }

    /* ======================================================
        Placement validation
    ====================================================== */

    validatePlacement() {

        const boxA =
            new THREE.Box3()
                .setFromObject(this.ghost);

        for (const component of
            this.editor.components) {

            const boxB =
                new THREE.Box3()
                    .setFromObject(component.mesh);

            if (boxA.intersectsBox(boxB)) {

                return false;
            }
        }

        return true;
    }

    /* ======================================================
        Green = valid
        Red = invalid
    ====================================================== */

    updateGhostMaterial() {

        const source =
            this.isValidPlacement
                ? this.validMaterial
                : this.invalidMaterial;

        this.ghost.traverse(child => {

            if (child.isMesh) {

                child.material.color.copy(

                    source.color
                );
            }
        });
    }

    /* ======================================================
        Rotate component
    ====================================================== */

    rotate90() {

        this.rotation +=
            Math.PI / 2;
    }

    rotate45() {

        this.rotation +=
            Math.PI / 4;
    }

    /* ======================================================
        Finalize placement
    ====================================================== */

    place() {

        if (!this.isValidPlacement)
            return;

        const placed =
            this.currentComponent.mesh.clone();

        placed.position.copy(

            this.ghost.position
        );

        placed.rotation.copy(

            this.ghost.rotation
        );

        this.editor.scene.add(placed);

        this.editor.components.push({

            mesh: placed,

            definition:
                this.currentComponent
        });

        this.cancel();
    }

    /* ======================================================
        Cancel
    ====================================================== */

    cancel() {

        if (this.ghost) {

            this.editor.scene.remove(
                this.ghost
            );
        }

        this.enabled = false;

        this.ghost = null;

        this.currentComponent = null;

        this.rotation = 0;
    }
}
