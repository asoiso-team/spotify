// ViewParticles.js 

(function() {
	var siteManager, params;
	var MAX_CAPICITY = 1750;

	ViewParticles = function(gl, isGlobe) {
		if(gl == undefined) return;
		siteManager  = breelNS.getNamespace(breelNS.projectName).singletons.siteManager;
		this.isGlobe = isGlobe;
		this._preCount = 0;

		View.call(this, gl, "facefront-vs", "particle-fs");
	}

	var p = ViewParticles.prototype = new View();
	var s = View.prototype;

	p._init = function() {
        this.isReady = false;
	};


	p.updateModel = function(ps) {
		var particles = [];
		for(var i=0;i<ps.length; i++) {
			if(this.isGlobe) {
				if(ps[i].isGlobeParticle) particles.push(ps[i]);
			} else {
				if(!ps[i].isGlobeParticle) particles.push(ps[i]);
			}
		}
		if(particles.length == 0) return;

		particles.sort(function(a, b) { return b.z - a.z; });

		// console.log( particles.length );

		var justCreated = false;
		if(this.model == undefined)  {
			this.model = new bongiovi.GLModel(this.gl, 4*MAX_CAPICITY);
			this.model.setAttribute(0, "aUVOffset", 2);
			this.model.setAttribute(1, "sizeOffset", 3);
			justCreated = true;
		}

		// this.model.clearBuffers();
		// this.model.createIndexBuffer(4*particles.length);
		var oDefault = {
			x:0,
			y:0,
			z:0,
			size:0,
			scaleInDepth:0,
			isGlobeParticle:false,
			colorIndex:0,
			alpha:0
		}
		var defaultCount = 0;
		for(var i=0; i<MAX_CAPICITY; i++) {
			var p = particles[i];
			
			if(p == undefined) {
				p = oDefault;
				defaultCount ++;
			}
			var size = 0;

	        this.model.updateVertex(i*4+0, p.x, p.y, p.z);
	        this.model.updateVertex(i*4+1, p.x, p.y, p.z);
	        this.model.updateVertex(i*4+2, p.x, p.y, p.z);
	        this.model.updateVertex(i*4+3, p.x, p.y, p.z);

	        
	        this.model.updateTextCoord(i*4+0, 0, 0);
	        this.model.updateTextCoord(i*4+1, 1, 0);
	        this.model.updateTextCoord(i*4+2, 1, 1);
	        this.model.updateTextCoord(i*4+3, 0, 1); 

	        var colorIndex = siteManager.settings.colors.length;
	        if(!p.isGlobeParticle) {
	        	colorIndex = p.colorIndex;		
	        } 

	        var tx = (colorIndex%4) * .25;
	       	var ty = .75- Math.floor(colorIndex/4) * .25;

	        this.model.updateAttribute(0, i*4+0, [tx, ty]); 
	        this.model.updateAttribute(0, i*4+1, [tx, ty]); 
	        this.model.updateAttribute(0, i*4+2, [tx, ty]); 
	        this.model.updateAttribute(0, i*4+3, [tx, ty]); 
	        
	        var alpha = p.alpha;
	        this.model.updateAttribute(1, i*4+0, [-p.size*p.scaleInDepth, -p.size*p.scaleInDepth, alpha]); 
	        this.model.updateAttribute(1, i*4+1, [ p.size*p.scaleInDepth, -p.size*p.scaleInDepth, alpha]); 
	        this.model.updateAttribute(1, i*4+2, [ p.size*p.scaleInDepth,  p.size*p.scaleInDepth, alpha]); 
	        this.model.updateAttribute(1, i*4+3, [-p.size*p.scaleInDepth,  p.size*p.scaleInDepth, alpha]); 
		}


		// console.log( "Default Count : ", defaultCount, MAX_CAPICITY );
		
        if(justCreated) this.model.generateBuffer();
        else this.model.updateBuffer();
        this.isReady = true;
	};


	p.render = function(camera, projection, texture) {
		if(!this.model) return;

		this.invert           = mat4.create(camera);
		mat4.inverse(this.invert)
		this.invertCamera     = mat4.toInverseMat3(this.invert);

		this.model.setTexture(0, texture);	
		this.shader.setParameter("invertCamera", "uniformMatrix3fv", this.invertCamera);
		this.model.render(this.shader, camera, projection);
	};
})();