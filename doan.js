var activeControl = false,
    hasLight = false,
    alpha = 0;
function init() {
    var scene = new THREE.Scene();
    var geometry, material, mesh;
    material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    var plane = getPlane(50);
    plane.position.y  = 0;
    scene.add(plane);
    var backgroundAllPoints = getBackgroundAllPoints();
    scene.add(backgroundAllPoints);

    var gridHelper = new THREE.GridHelper(50, 30, "#fff", "#fff");
    //gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    var pointLight = getPointLight(0xffffff, 10, 100);

    var gui = new dat.GUI();
    gui.domElement.id = "GUI";

    //Handle event on click geometry
    $(".geometry").click(function () {
        if (activeControl) {
            $(".controls-btn.active").removeClass("active");
            transformControls.detach(mesh);
        }

        var geometryName = $(this).text();

        switch (geometryName) {
            case "Box":
                geometry = new THREE.BoxGeometry(5, 5, 5);
                break;
            case "Sphere":
                geometry = new THREE.SphereGeometry(3);
                break;
            case "Cone":
                geometry = new THREE.ConeGeometry(3, 8, 32);
                break;
            case "Cylinder":
                geometry = new THREE.CylinderGeometry(3, 3, 8, 32);
                break;
            case "Wheel":
                geometry = new THREE.TorusGeometry(4, 2, 16, 100);
                break;
            case "Teapot":
                geometry = new THREE.TeapotGeometry(4, 10);
                break;
        }
        mesh = new THREE.Mesh(geometry, material);

        scene.remove(scene.getObjectByName("geometry"));

        mesh.name = "geometry";
        mesh.castShadow = true; // Shadow (đổ bóng).

        scene.add(mesh);
    });

    //Handle event on click surface
    $(".surface").click(function () {
        if (activeControl) {
            $(".controls-btn.active").removeClass("active");
            transformControls.detach(mesh);
        }

        var loader = new THREE.TextureLoader();
        scene.remove(scene.getObjectByName("geometry"));

        var materialName = $(this).text(),
            materialColor = material.color;

        switch (materialName) {
            case "Point":
                material = new THREE.PointsMaterial({ color: materialColor, size: 0.2 });
                mesh = new THREE.Points(geometry, material);
                break;
            case "Line":
                material = new THREE.LineBasicMaterial({ color: materialColor });
                mesh = new THREE.Line(geometry, material);
                break;
            case "Solid":
                material = new THREE.MeshBasicMaterial({ color: materialColor });
                mesh = new THREE.Mesh(geometry, material);
                break;
            case "Texture":
                material = new THREE.MeshBasicMaterial({
                    map: loader.load("./assets/textures/img.png"),
                });
                mesh = new THREE.Mesh(geometry, material);
                break;
        }
        mesh.name = "geometry";
        mesh.castShadow = true; // Shadow (đổ bóng).
        scene.add(mesh);
    });

    //Handle event click on button controls
    $(".controls-btn").click(function () {
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            transformControls.detach(mesh);
            activeControl = false;
        } else {
            activeControl = true;
            const controlType = $(this).attr("type");
            switch (controlType) {
                case "translate":
                    transformControls.attach(mesh);
                    transformControls.setMode("translate");
                    break;
                case "rotate":
                    transformControls.attach(mesh);
                    transformControls.setMode("rotate");
                    break;
                case "scale":
                    transformControls.attach(mesh);
                    transformControls.setMode("scale");
                    break;
                case "move-light":
                    transformControls.attach(pointLight);
                    transformControls.setMode("translate");
                    break;
            }

            $(".controls-btn.active").removeClass("active");
            $(this).addClass("active");

            scene.add(transformControls);
        }
    });

    //Handle event on click light
    $(".light").click(function () {
        if ($(this).text() == "Turn on/off Light" && hasLight === false) {
            hasLight = true;
            scene.add(pointLight);

            var plane = getPlane(150);
            gridHelper.add(plane);

            var pointLightHelper = getPointLightHelper(pointLight);
            scene.add(pointLightHelper);

            planeColorGUI = addColorGUI(plane.material, "Plane Color", { color: 0x00000 }, colorGUI);
        } else {
            hasLight = false;

            scene.remove(scene.getObjectByName("Turn on/off Light"));
            scene.remove(scene.getObjectByName("PointLightHelper"));
            gridHelper.remove(scene.getObjectByName("Plane"));

            colorGUI.remove(planeColorGUI);
        }
    });

    //Handle event on click animation
    $(".animation").click(function () {
        var $nameAnimation = $(this).text();
        if ($(".animation.active").hasClass("active")) {
            $(".animation.active").removeClass("active");
        }
        switch ($nameAnimation) {
            case "Spin":
                $(this).addClass("active");
                break;
            case "Up down Spin":
                $(this).addClass("active");
                break;
            case "Stop":
                break;
        }
    });

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(10, 7, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateProjectionMatrix();
    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 46);
    renderer.setClearColor("#15151e");
    renderer.shadowMap.enabled = true; // ShadowMap (Đổ bóng).
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Type of shadowMap.
    document.getElementById("WebGL").appendChild(renderer.domElement);
    renderer.render(scene, camera);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    var transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.size = 1;
    transformControls.addEventListener("dragging-changed", (event) => {
        controls.enabled = !event.value;
    });

    var planeColorGUI;
    var colorGUI = gui.addFolder("Color");
    addColorGUI(material, "Geometry Color", { color:  0xffffff }, colorGUI);
    addColorGUI(pointLight, "Light Color", { color: 0xffffff }, colorGUI);
    colorGUI.open();


    var cameraGUI = gui.addFolder("Camera");
    cameraGUI.add(camera, "fov", 0, 200).name("FOV").onChange(updateCamera);
    cameraGUI.add(camera, "far", 1000, 5000, 10).name("Far").onChange(updateCamera);
    cameraGUI.add(camera, "near", 1, 50, 1).name("Near").onChange(updateCamera);
    cameraGUI.open();

    var lightGUI = gui.addFolder("Light Control");
    lightGUI.add(pointLight, "intensity", 1, 20, 1).name("Brightness Level");
    lightGUI.add(pointLight, "distance", 1, 200, 1).name("Distance");
    lightGUI.open();

    update(renderer, scene, camera, controls);
}

function update(renderer, scene, camera, controls) {
    renderer.render(scene, camera);
    controls.update();

    var geometry = scene.getObjectByName("geometry");
    var name = $(".animation.active").text();
    switch (name) {
        case "Spin":
            geometry.rotation.x = Date.now() * 0.0005;
            geometry.rotation.y = Date.now() * 0.003;
            geometry.rotation.z = (Math.sin(Date.now() * 0.001) + 1) * 10;
            break;
        case "Up down Spin":
            geometry.position.y = (Math.sin(Date.now() * 0.002) + 1) * 5;
            geometry.rotation.y = Math.sin(alpha) * 5;
            geometry.rotation.z =  Date.now() * 0.0005;
            break;
    }

    requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);
    });
}

function getPlane(size) {
    var geometry = new THREE.PlaneGeometry(size, size);
    var material = new THREE.MeshStandardMaterial({
        color: "#15151e",
        side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true; // Receive shadow (Nhận đỗ bóng).
    mesh.rotation.x = Math.PI / 2;
    mesh.name = "Plane";

    return mesh;
}
function getPointLight(color, intensity, distance) {
    var pointLight = new THREE.PointLight(color, intensity, distance);
    pointLight.position.set(10, 10, 10);
    pointLight.castShadow = true;
    pointLight.name = "Turn on/off Light";

    return pointLight;
}

function getPointLightHelper(pointLight) {
    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    pointLightHelper.name = "PointLightHelper";

    return pointLightHelper;
}

function getBackgroundAllPoints() {
    const vertices = [];
    const geometry1 = new THREE.BufferGeometry();
    geometry1.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    const material1 = new THREE.PointsMaterial({ color: 0xfffff });

    const points = new THREE.Points(geometry1, material1);

    return points;
}

function addColorGUI(obj, name, params, folder) {
    var objColorGUI = folder
        .addColor(params, "color")
        .name(name)
        .onChange(function () {
            obj.color.set(params.color);
        });

    return objColorGUI;
}
init();
