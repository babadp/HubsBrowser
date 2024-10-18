class ImageRenderExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewsNames = {};
    }

    load() {
        // Set background environment to "Infinity Pool"
        // and make sure the environment background texture is visible
        // this.viewer.setLightPreset(6);
        this.viewer.setEnvMapBackground(true);

        // Ensure the model is centered
        this.viewer.fitToView();

        return true;
    }

    unload() {

    }

    onToolbarCreated(toolbar) {
        let viewer = this.viewer;

        let button1 = createToolbarButton('snapshot-button', 'https://img.icons8.com/ios/30/camera--v3.png', 'Tomar Captura');
        button1.onClick = async function (e) {
            try {
                // Este es el id que utilizarán imagenes y prompt en comfy.
                let seed = Math.floor(Date.now() + (Math.random() * (1 - 100000000000)));
                console.log(seed);
                await readDepthAndNormalMaps(viewer,seed);
                await sacaCaptura(viewer,seed);
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Iniciar el workflow después de la espera
                iniciaWorkflow(document.getElementById('positiveprompt').value, seed);
                muestraWorkflow();
            } catch (error) {
                console.error('Error en el proceso:', error);
            }
        };
        // SubToolbar
        this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
        this.subToolbar.addControl(button1);

        toolbar.addControl(this.subToolbar);
    }
}

// funcion para crear boton de snapshots
function createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
        icon.style.backgroundImage = `url(${buttonIconUrl})`;
        icon.style.backgroundSize = `24px`;
        icon.style.backgroundRepeat = `no-repeat`;
        icon.style.backgroundPosition = `center`;
    }
    return button;
}



Autodesk.Viewing.theExtensionManager.registerExtension('ImageRenderExtension', ImageRenderExtension);