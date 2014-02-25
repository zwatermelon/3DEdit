/**
 * @author arodic / https://github.com/arodic
 */

 "use strict";

THREE.TransformGizmoMaterial = function ( parameters ) {

	THREE.MeshBasicMaterial.call( this );

	this.depthTest = false;
	this.depthWrite = false;
	this.side = THREE.DoubleSide;
	this.transparent = true;

	this.setValues( parameters );

}

THREE.TransformGizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );

/*
*С������������
*/
THREE.TransformGizmo = function () {

	this.handleGizmos = {
		X: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0xff0000 } ) ),
			new THREE.Vector3( 0.5, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0x00ff00 } ) ),
			new THREE.Vector3( 0, 0.5, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0x0000ff } ) ),
			new THREE.Vector3( 0, 0, 0.5 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]
	}

	var showPickers = false; //debug
	var showActivePlane = false; //debug
	
	//��С�������ڲ��ṹ���г�ʼ��
	this.init = function () {

		THREE.Object3D.call( this );

		this.handles = new THREE.Object3D(); //Բ������(�ɼ�����object)
		this.pickers = new THREE.Object3D(); //ʰȡ����
		this.planes = new THREE.Object3D();  //ƽ��

		this.add(this.handles); //�����������и����ߵĸ�Object
		this.add(this.pickers);
		this.add(this.planes);

		//// PLANES

		var planeGeometry = new THREE.PlaneGeometry( 50, 50, 2, 2 );
		var planeMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
		planeMaterial.side = THREE.DoubleSide;

		var planes = {
			"XY": new THREE.Mesh( planeGeometry, planeMaterial ),
			"YZ": new THREE.Mesh( planeGeometry, planeMaterial ),
			"XZ": new THREE.Mesh( planeGeometry, planeMaterial ),
			"XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
		};

		planes["YZ"].rotation.set( 0, Math.PI/2, 0 );
		planes["XZ"].rotation.set( -Math.PI/2, 0, 0 );

		for (var i in planes) {
			planes[i].name = i;
			this.planes.add(planes[i]);
			this.planes[i] = planes[i];
			planes[i].visible = false;
		}

		//// HANDLES AND PICKERS
		//console.log(this.handleGizmos);
		for ( var i in this.handleGizmos ) { /*�������еĿ�ʰȡ����*/
			//console.log(this.handleGizmos);
			var handle = this.handleGizmos[i][0]; // �ƶ�Բ��mesh
			handle.name = i;
			if ( this.handleGizmos[i][1] ) handle.position.set( this.handleGizmos[i][1].x, this.handleGizmos[i][1].y, this.handleGizmos[i][1].z );
			if ( this.handleGizmos[i][2] ) handle.rotation.set( this.handleGizmos[i][2].x, this.handleGizmos[i][2].y, this.handleGizmos[i][2].z );
			
			this.handles.add( handle );

			if ( this.pickerGizmos && this.pickerGizmos[i] ) {

				var picker = this.pickerGizmos[i][0]; //�ƶ�ʰȡԲ��mesh
				if ( this.pickerGizmos[i][1] ) picker.position.set( this.pickerGizmos[i][1].x, this.pickerGizmos[i][1].y, this.pickerGizmos[i][1].z );
				if ( this.pickerGizmos[i][2] ) picker.rotation.set( this.pickerGizmos[i][2].x, this.pickerGizmos[i][2].y, this.pickerGizmos[i][2].z );
			
			} else {

				var picker = handle.clone();

			}

			picker.name = i; //Բ����ʰȡԲ�������ֶ��ǣ�"X" ,"Y", "Z"��
			this.pickers.add( picker );

		}

		// reset Transformations

		this.traverse(function (child) {
			//console.log(child);
			if (child instanceof THREE.Mesh) {
				//console.log(child);
				var tempGeometry = new THREE.Geometry();
				THREE.GeometryUtils.merge( tempGeometry, child ); //�����������е�mesh���ֱ���ӵ�һ���յļ������ϣ�����ʼ����ת��λ�ã���С
				child.geometry = tempGeometry;
				child.position.set( 0, 0, 0 );
				child.rotation.set( 0, 0, 0 );
				child.scale.set( 1, 1, 1 );
			}
		});

	}

	this.hide = function () {

		for ( var j in this.handles.children ) this.handles.children[j].visible = false;

		for ( var j in this.pickers.children ) this.pickers.children[j].visible = false;

		for ( var j in this.planes.children ) this.planes.children[j].visible = false;

	}

	this.show = function () {

		for ( var i in this.handles.children ) {

			this.handles.children[i].visible = true;

		}

		for ( var i in this.pickers.children ) {

			this.pickers.children[i].visible = showPickers;

		}

		if (this.activePlane) this.activePlane.visible = showActivePlane;

	}

	this.highlight = function ( axis ) {

		var handle;

		for ( var i in this.handleGizmos ) {

			handle = this.handleGizmos[ i ][0]; // mesh

			if ( handle.material.oldColor ) { //�ָ������ɫ��͸����

				handle.material.color.copy( handle.material.oldColor );
				handle.material.opacity = handle.material.oldOpacity;

			}

		}

		if ( this.handleGizmos[ axis ] ) {
		
			handle = this.handleGizmos[ axis ][0]; // mesh

			handle.material.oldColor = handle.material.color.clone(); //�洢ѡ�������ɫ,��͸����
			handle.material.oldOpacity = handle.material.opacity;
	 
			handle.material.color.setRGB( 1, 1, 0 );
			handle.material.opacity = 1;

		}

	}

	//this.init();

}

THREE.TransformGizmo.prototype = Object.create( THREE.Object3D.prototype );

/*
*@p	rotation : Euler
*@p eye  Vector3
*/
THREE.TransformGizmo.prototype.update = function ( rotation, eye ) { //����ƶ��ͻ����	 ���տ�ʼ�����ʱ��������Ĵ�
	//console.log(rotation);
	//console.log(eye);
	//console.log("TransformGizmo.Update()");
	var vec1 = new THREE.Vector3( 0, 0, 0 );
	var vec2 = new THREE.Vector3( 0, 1, 0 );
	var lookAtMatrix = new THREE.Matrix4();
	//console.log(this.children[0]);
	for ( var i in this.children ) { //this : С�����࣬ this.children : ����С�����ĸ�Object

		for ( var j in this.children[i].children ) {

			var object = this.children[i].children[j]; //���е�mesh
			//console.log(object);
			if ( object.name.search("E") != -1 ) { //�ַ���������д�� ��E��

				object.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

			} else {

				object.quaternion.setFromEuler( rotation ); //����Euler��(�ƶ�������ʱŷ����Ϊ0)

			}

		}

	}

}

/*
* �ƶ�С������
**/
THREE.TransformGizmoTranslate = function () {

	THREE.TransformGizmo.call( this );

	var arrowGeometry = new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false ); //���� (1)
	//var arrowGeometry = new THREE.Geometry()
	var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0.0, 0.05, 0.2, 12, 1, false ) ); //�ƶ���ͷ(0.2)
	mesh.position.y = 0.5;
	THREE.GeometryUtils.merge( arrowGeometry, mesh ); //(������(�����ǿն���)���һ����Object(mesh))
				
	this.handleGizmos = {

		X: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: 0xff0000 } ) ),
			new THREE.Vector3( 0.5, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: 0x00ff00 } ) ),
			new THREE.Vector3( 0, 0.5, 0 )
		],
		Z: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: 0x0000ff } ) ),
			new THREE.Vector3( 0, 0, 0.5 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		],
		/*XYZ: [ //�����򶼿����ƶ�
			new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new THREE.TransformGizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) )
		],
		XY: [//XYƽ���ƶ�
			new THREE.Mesh( new THREE.PlaneGeometry( 0.29, 0.29 ), new THREE.TransformGizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ),
			new THREE.Vector3( 0.15, 0.15, 0 )
		],
		YZ: [//YZƽ���ƶ�
			new THREE.Mesh( new THREE.PlaneGeometry( 0.29, 0.29 ), new THREE.TransformGizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0.15, 0.15 ),
			new THREE.Vector3( 0, Math.PI/2, 0 )
		],
		XZ: [//XZƽ���ƶ�
			new THREE.Mesh( new THREE.PlaneGeometry( 0.29, 0.29 ), new THREE.TransformGizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ),
			new THREE.Vector3( 0.15, 0, 0.15 ),
			new THREE.Vector3( -Math.PI/2, 0, 0 )
		]*/

	}

	this.pickerGizmos = {

		X: [ 
			new THREE.Mesh( new THREE.CylinderGeometry( 0.075, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0xff0000, opacity: 0.25 } ) ),
			new THREE.Vector3( 0.6, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.075, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0x00ff00, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0.6, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.075, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0x0000ff, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0.6 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]

	}
	
	/*
	*@p axis : �ƶ���
	*@p eye :  Vector3
	*/
	this.setActivePlane = function ( axis, eye ) {
		
		//console.log(axis);
		//console.log(eye);
		var tempMatrix = new THREE.Matrix4();
		eye.applyProjection( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) ); //����ûʲôӰ��?
		//�߸����ƶ��ĵ�
		if ( axis == "X" ) {
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.y) > Math.abs(eye.z) ) this.activePlane = this.planes[ "XZ" ];
		}

		if ( axis == "Y" ){
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.x) > Math.abs(eye.z) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "Z" ){
			this.activePlane = this.planes[ "XZ" ];
			if ( Math.abs(eye.x) > Math.abs(eye.y) ) this.activePlane = this.planes[ "YZ" ];
		}

		/*if ( axis == "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		if ( axis == "XY" ) this.activePlane = this.planes[ "XY" ];

		if ( axis == "YZ" ) this.activePlane = this.planes[ "YZ" ];

		if ( axis == "XZ" ) this.activePlane = this.planes[ "XZ" ];*/

		this.hide();  //����������
		this.show();  //������������ʾ��Ҫ����

	}

	this.init();

}

THREE.TransformGizmoTranslate.prototype = Object.create( THREE.TransformGizmo.prototype );

/*
*��תС����
*/
THREE.TransformGizmoRotate = function () {

	THREE.TransformGizmo.call( this );
	
	//��ʾ��/ �ĸ�E����������ģ�
	this.handleGizmos = {

		X: [ //��X����ת��Բ��
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 32, Math.PI ), new THREE.TransformGizmoMaterial( { color: 0xff0000 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, -Math.PI/2, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 32, Math.PI ), new THREE.TransformGizmoMaterial( { color: 0x00ff00 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 32, Math.PI ), new THREE.TransformGizmoMaterial( { color: 0x0000ff } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		/*E: [
			new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.005, 4, 64 ), new THREE.TransformGizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) )
		],
		XYZE: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.005, 4, 64 ), new THREE.TransformGizmoMaterial( { color: 0x787878 } ) )
		]*/

	}
	//��ײ��
	this.pickerGizmos = {

		X: [ ////��X����ת��Բ��(ʰȡ��)
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12, Math.PI ), new THREE.TransformGizmoMaterial( { color: 0xff0000, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, -Math.PI/2, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12, Math.PI ), new THREE.TransformGizmoMaterial( { color: 0x00ff00, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.TorusGeometry( 1, 0.05, 4, 12, Math.PI ), new THREE.TransformGizmoMaterial( { color: 0x0000ff, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		/*E: [
			new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.05, 2, 24 ), new THREE.TransformGizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) )
		],
		XYZE: [
			new THREE.Mesh( new THREE.Geometry() ) // TODO
		]*/

	}

	this.setActivePlane = function ( axis ) {

		if ( axis == "E" ) this.activePlane = this.planes[ "XYZE" ];
		
	 	if ( axis == "X" ) this.activePlane = this.planes[ "YZ" ];

		if ( axis == "Y" ) this.activePlane = this.planes[ "XZ" ];

		if ( axis == "Z" ) this.activePlane = this.planes[ "XY" ];
		//console.log("2014/1/15 leis");
		//console.log(this);
		this.hide();
		this.show();

	}
	
	this.update = function ( rotation, eye2 ) {
		
		THREE.TransformGizmo.prototype.update.apply( this, arguments ); //��this.update()ִ�е�ʱ��ͬʱ����������TransformGizmo�ķ���update()
		//console.log("TransformGizmoRotate.Update()");
		var group = {
			handles: this["handles"],
			pickers: this["pickers"],
		}
		//console.log("2014/1/15 leis");
		//console.log(this);
		var tempMatrix = new THREE.Matrix4();
		var worldRotation = new THREE.Euler( 0, 0, 1 );
		var tempQuaternion = new THREE.Quaternion();
		var unitX = new THREE.Vector3( 1, 0, 0 );
		var unitY = new THREE.Vector3( 0, 1, 0 );
		var unitZ = new THREE.Vector3( 0, 0, 1 );
		var quaternionX = new THREE.Quaternion();
		var quaternionY = new THREE.Quaternion();
		var quaternionZ = new THREE.Quaternion();
		var eye = eye2.clone();

		worldRotation.copy( this.planes["XY"].rotation );
		tempQuaternion.setFromEuler( worldRotation );

		tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
		eye.applyProjection( tempMatrix );

		for ( var i in group ) {

			for ( var j in group[i].children ) {

				var object = group[i].children[j];
				//console.log(object);
				tempQuaternion.setFromEuler( worldRotation );

				if ( object.name == "X" ) {
					quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					object.quaternion.copy( tempQuaternion );
				}

				if ( object.name == "Y" ) {
					quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					object.quaternion.copy( tempQuaternion );
				}

				if ( object.name == "Z" ) {
					quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
					object.quaternion.copy( tempQuaternion );
				}

			}
		}

	}

	this.init();

}

THREE.TransformGizmoRotate.prototype = Object.create( THREE.TransformGizmo.prototype );

/*
*����С����
*/
THREE.TransformGizmoScale = function () {

	THREE.TransformGizmo.call( this );

	var arrowGeometry = new THREE.CylinderGeometry( 0.005, 0.005, 1, 4, 1, false );  //����
	var mesh = new THREE.Mesh( new THREE.CubeGeometry( 0.125, 0.125, 0.125 ) ); //ͷ
	mesh.position.y = 0.5;
	THREE.GeometryUtils.merge( arrowGeometry, mesh ); //��Ϊһ��(������mesh)
	//�ĸ������ŵ�
	this.handleGizmos = {

		XYZ: [
			new THREE.Mesh( new THREE.CubeGeometry( 0.125, 0.125, 0.125 ), new THREE.TransformGizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) )
		],
		X: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: 0xff0000 } ) ),
			new THREE.Vector3( 0.5, 0, 0 ),
			new THREE.Vector3( 0, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: 0x00ff00 } ) ),
			new THREE.Vector3( 0, 0.5, 0 )
		],
		Z: [
			new THREE.Mesh( arrowGeometry, new THREE.TransformGizmoMaterial( { color: 0x0000ff } ) ),
			new THREE.Vector3( 0, 0, 0.5 ),
			new THREE.Vector3( Math.PI/2, 0, 0 )
		]

	}

	this.pickerGizmos = {

		X: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.125, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0xff0000, opacity: 0.25 } ) ),
			new THREE.Vector3( 0.6, 0, 0 ),
			new THREE.Vector3( Math.PI/4, 0, -Math.PI/2 )
		],
		Y: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.125, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0x00ff00, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0.6, 0 ),
			new THREE.Vector3( 0, Math.PI/4, 0 )
		],
		Z: [
			new THREE.Mesh( new THREE.CylinderGeometry( 0.125, 0, 1, 4, 1, false ), new THREE.TransformGizmoMaterial( { color: 0x0000ff, opacity: 0.25 } ) ),
			new THREE.Vector3( 0, 0, 0.6 ),
			new THREE.Vector3( Math.PI/2, Math.PI/4, 0 )
		]

	}

	this.setActivePlane = function ( axis, eye ) {

		var tempMatrix = new THREE.Matrix4();
		eye.applyProjection( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

		if ( axis == "X" ) {
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.y) > Math.abs(eye.z) ) this.activePlane = this.planes[ "XZ" ];
		}

		if ( axis == "Y" ){
			this.activePlane = this.planes[ "XY" ];
			if ( Math.abs(eye.x) > Math.abs(eye.z) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "Z" ){
			this.activePlane = this.planes[ "XZ" ];
			if ( Math.abs(eye.x) > Math.abs(eye.y) ) this.activePlane = this.planes[ "YZ" ];
		}

		if ( axis == "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

		this.hide();
		this.show();

	}

	this.init();
}
THREE.TransformGizmoScale.prototype = Object.create( THREE.TransformGizmo.prototype );


THREE.TransformControls = function ( camera, domElement ) {

	// TODO: Make non-uniform scale and rotate play nice in hierarchies
	// TODO: ADD RXYZ contol

	THREE.Object3D.call( this );

	domElement = ( domElement !== undefined ) ? domElement : document;

	this.gizmo = {}
	//this.gizmo["translate"] = new THREE.TransformGizmoTranslate();
	//this.gizmo["rotate"] = new THREE.TransformGizmoRotate();
	//this.gizmo["scale"] = new THREE.TransformGizmoScale();
	
	this.gizmo = {
		translate : new THREE.TransformGizmoTranslate(),
		rotate : new THREE.TransformGizmoRotate(),
		scale : new THREE.TransformGizmoScale(),
		//rotate : null,
		//scale : null,
	}
	this.add(this.gizmo["translate"]);
	this.add(this.gizmo["rotate"]);
	this.add(this.gizmo["scale"]);

	this.gizmo["translate"].hide();
	this.gizmo["rotate"].hide();
	this.gizmo["scale"].hide();

	this.object = false;
	this.snap = false;
	this.space = "world";
	this.size = 1;
	this.axis = false;

	var scope = this;
	
	var _dragging = false;
	var _mode = "translate";
	var _plane = "XY";

	var changeEvent = { type: "change" };

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var pointerVector = new THREE.Vector3();

	var point = new THREE.Vector3();
	var offset = new THREE.Vector3();

	var rotation = new THREE.Vector3();
	var offsetRotation = new THREE.Vector3();
	var scale = 1;

	var lookAtMatrix = new THREE.Matrix4();
	var eye = new THREE.Vector3()

	var tempMatrix = new THREE.Matrix4();
	var tempVector = new THREE.Vector3();
	var tempQuaternion = new THREE.Quaternion();
	var unitX = new THREE.Vector3( 1, 0, 0 );
	var unitY = new THREE.Vector3( 0, 1, 0 );
	var unitZ = new THREE.Vector3( 0, 0, 1 );

	var quaternionXYZ = new THREE.Quaternion();
	var quaternionX = new THREE.Quaternion();
	var quaternionY = new THREE.Quaternion();
	var quaternionZ = new THREE.Quaternion();
	var quaternionE = new THREE.Quaternion();

	var oldPosition = new THREE.Vector3();
	var oldScale = new THREE.Vector3();
	var oldRotationMatrix = new THREE.Matrix4();

	var parentRotationMatrix  = new THREE.Matrix4();
	var parentScale = new THREE.Vector3();

	var worldPosition = new THREE.Vector3();
	var worldRotation = new THREE.Euler();
	var worldRotationMatrix  = new THREE.Matrix4();
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Euler();
	//console.log(domElement);
	domElement.addEventListener( "mousedown", onPointerDown, false );
	domElement.addEventListener( "touchstart", onPointerDown, false );

	domElement.addEventListener( "mousemove", onPointerHover, false );
	domElement.addEventListener( "touchmove", onPointerHover, false );

	domElement.addEventListener( "mousemove", onPointerMove, false );
	domElement.addEventListener( "touchmove", onPointerMove, false );

	domElement.addEventListener( "mouseup", onPointerUp, false );
	domElement.addEventListener( "mouseout", onPointerUp, false );
	domElement.addEventListener( "touchend", onPointerUp, false );
	domElement.addEventListener( "touchcancel", onPointerUp, false );
	domElement.addEventListener( "touchleave", onPointerUp, false );

	this.attach = function ( object ) {

		scope.object = object;

	 	this.gizmo["translate"].hide();
	 	this.gizmo["rotate"].hide();
	 	this.gizmo["scale"].hide();
	 	this.gizmo[_mode].show();

	 	scope.dispatchEvent( changeEvent );
	 	scope.update();

	}

	this.detach = function ( object ) {

		scope.object = false;
		this.axis = false;

	 	this.gizmo["translate"].hide();
	 	this.gizmo["rotate"].hide();
	 	this.gizmo["scale"].hide();

	}

	this.setMode = function ( mode ) {

		_mode = mode ? mode : _mode;

		if ( _mode == "scale" ) scope.space = "local";

	 	this.gizmo["translate"].hide();
	 	this.gizmo["rotate"].hide();
	 	this.gizmo["scale"].hide();	
	 	this.gizmo[_mode].show();

	 	scope.dispatchEvent( changeEvent );
		this.update();

	}

	this.setSnap = function ( snap ) {

		scope.snap = snap;

	}

	this.setSize = function ( size ) {

		scope.size = size;
	 	scope.dispatchEvent( changeEvent );
		this.update();
	 	
	}

	this.setSpace = function ( space ) {

		scope.space = space;

	 	scope.dispatchEvent( changeEvent );
		this.update();

	}
	
	//ÿ֡������
	this.update = function () {

		if ( !scope.object ) return;

		scope.object.updateMatrixWorld();
		worldPosition.getPositionFromMatrix( scope.object.matrixWorld ); //�õ��������������
		worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( scope.object.matrixWorld ) );

		camera.updateMatrixWorld();
		camPosition.getPositionFromMatrix( camera.matrixWorld );
		camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

		scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
		this.position.copy( worldPosition )
		this.scale.set( scale, scale, scale );

		eye.copy( camPosition ).sub( worldPosition ).normalize();

		if ( scope.space == "local" )
			this.gizmo[_mode].update( worldRotation, eye );

		else if ( scope.space == "world" )
			this.gizmo[_mode].update( new THREE.Euler(), eye );

		this.gizmo[_mode].highlight( scope.axis );

	}

	function onPointerHover( event ) {
		
		if ( !scope.object || _dragging ) return;

		event.preventDefault();
		event.stopPropagation();

		var pointer = event.touches? event.touches[0] : event;

		var intersect = intersectObjects( pointer, scope.gizmo[_mode].pickers.children ); //�볡���еļ���С������ʰȡ����������Ӷ�������ײ

		if ( intersect ) {

			scope.axis = intersect.object.name;
			scope.dispatchEvent( changeEvent );
			scope.update();

		} else {

			scope.axis = false;
			scope.dispatchEvent( changeEvent );
			scope.update();

		}

	};

	function onPointerDown( event ) {
		//console.log("onPointerDown");
		if ( !scope.object || _dragging ) return;

		event.preventDefault();
		event.stopPropagation();

		var pointer = event.touches? event.touches[0] : event;

		if ( pointer.button === 0 || pointer.button == undefined ) {

			var intersect = intersectObjects( pointer, scope.gizmo[_mode].pickers.children ); //������ʰȡObject��ײ

			if ( intersect ) {

				scope.axis = intersect.object.name;

				scope.update();
				
				eye.copy( camPosition ).sub( worldPosition ).normalize(); //�ӽ�
				//console.log(worldPosition);
				//console.log(camPosition);
				scope.gizmo[_mode].setActivePlane( scope.axis, eye );

				var planeIntersect = intersectObjects( pointer, [scope.gizmo[_mode].activePlane] ); //������ƽ����ײ

				if ( planeIntersect ) {

					oldPosition.copy( scope.object.position );
					oldScale.copy( scope.object.scale );

					oldRotationMatrix.extractRotation( scope.object.matrix );
					worldRotationMatrix.extractRotation( scope.object.matrixWorld );

					parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );
					parentScale.getScaleFromMatrix( tempMatrix.getInverse( scope.object.parent.matrixWorld ) );

					offset.copy( planeIntersect.point ); //�洢��ʼ��ײ��

				}

			}

		}

		_dragging = true;

	};

	function onPointerMove( event ) {
		//console.log("onPointerMove");
		if ( !scope.object || !scope.axis || !_dragging ) return;

		event.preventDefault();
		event.stopPropagation();

		var pointer = event.touches? event.touches[0] : event;

		var planeIntersect = intersectObjects( pointer, [scope.gizmo[_mode].activePlane] ); //������ƽ����ײ

		if ( planeIntersect ) {

			point.copy( planeIntersect.point );

			if ( _mode == "translate" ) {

				point.sub( offset );
				point.multiply(parentScale);

				if ( scope.space == "local" ) {

					point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					if ( scope.axis.search("X") == -1 ) point.x = 0;
					if ( scope.axis.search("Y") == -1 ) point.y = 0;
					if ( scope.axis.search("Z") == -1 ) point.z = 0;

					point.applyMatrix4( oldRotationMatrix );

					scope.object.position.copy( oldPosition );
					scope.object.position.add( point );

				} 

				if ( scope.space == "world" || scope.axis.search("XYZ") != -1 ) {
					console.log("move");
					if ( scope.axis.search("X") == -1 ) point.x = 0; //���û������X�ᣬ����ײ���x����Ϊ0(���ƶ�Y����Z,X��ԶΪ0)
					if ( scope.axis.search("Y") == -1 ) point.y = 0; //(���ƶ�X����Z,Y��ԶΪ0)
					if ( scope.axis.search("Z") == -1 ) point.z = 0; //(���ƶ�X����Y,Z��ԶΪ0)

					point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) ); //?

					scope.object.position.copy( oldPosition );
					scope.object.position.add( point );  //�ƶ�����ײ��

					if ( scope.snap ) {

						if ( scope.axis.search("X") != -1 ) scope.object.position.x = Math.round( scope.object.position.x / scope.snap ) * scope.snap;
						if ( scope.axis.search("Y") != -1 ) scope.object.position.y = Math.round( scope.object.position.y / scope.snap ) * scope.snap;
						if ( scope.axis.search("Z") != -1 ) scope.object.position.z = Math.round( scope.object.position.z / scope.snap ) * scope.snap;
					
					}

				}

			} else if ( _mode == "scale" ) {

				point.sub( offset );
				point.multiply(parentScale);

				if ( scope.space == "local" ) {

					if ( scope.axis == "XYZ") {

						scale = 1 + ( ( point.y ) / 50 );

						scope.object.scale.x = oldScale.x * scale;
						scope.object.scale.y = oldScale.y * scale;
						scope.object.scale.z = oldScale.z * scale;

					} else {

						point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

						if ( scope.axis == "X" ) scope.object.scale.x = oldScale.x * ( 1 + point.x / 50 );
						if ( scope.axis == "Y" ) scope.object.scale.y = oldScale.y * ( 1 + point.y / 50 );
						if ( scope.axis == "Z" ) scope.object.scale.z = oldScale.z * ( 1 + point.z / 50 );

					}

				}

			} else if ( _mode == "rotate" ) {

				point.sub( worldPosition );
				point.multiply(parentScale);
				tempVector.copy(offset).sub( worldPosition );
				tempVector.multiply(parentScale);

				if ( scope.axis == "E" ) {

					point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
					tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

					quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				} else if ( scope.axis == "XYZE" ) {

					quaternionE.setFromEuler( point.clone().cross(tempVector).normalize() ); // rotation axis

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
					quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo(tempVector) );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				} else if ( scope.space == "local" ) {

					point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );
					quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
					quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
					quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

					if ( scope.axis == "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
					if ( scope.axis == "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
					if ( scope.axis == "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

					scope.object.quaternion.copy( quaternionXYZ );

				} else if ( scope.space == "world" ) {

					rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
					offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

					tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

					quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
					quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
					quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );
					quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

					if ( scope.axis == "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
					if ( scope.axis == "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
					if ( scope.axis == "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

					tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

					scope.object.quaternion.copy( tempQuaternion );

				}

			}

		}

		scope.dispatchEvent( changeEvent );
		scope.update();

	}

	function onPointerUp( event ) {

		scope.axis = false;
		_dragging = false;
		scope.dispatchEvent( changeEvent );
		scope.update();

	}

	function intersectObjects( pointer, objects ) {

	    var rect = domElement.getBoundingClientRect();
	    var x = (pointer.clientX - rect.left) / rect.width;
	    var y = (pointer.clientY - rect.top) / rect.height;
		pointerVector.set( ( x ) * 2 - 1, - ( y ) * 2 + 1, 0.5 ); //��Ļ�ϵĵ�ת��Ϊ��������ĵ�

		projector.unprojectVector( pointerVector, camera ); //ȥ�������˵�
		ray.set( camPosition, pointerVector.sub( camPosition ).normalize() ); //����㣬��������

		var intersections = ray.intersectObjects( objects, true ); //������ײ����
		return intersections[0] ? intersections[0] : false;

	}

};

THREE.TransformControls.prototype = Object.create( THREE.Object3D.prototype );