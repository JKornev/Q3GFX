
var s_blinkingTimer;
var s_blinkingTimerInterval = 50;

// ==================
//  Public interface
// ==================


function Q3GFX_Initialize(params)
{
	/*
	context stucture
		params: 
			canvasId:			(string) canvas id
			backgroundImage:	(string) background image path
			nickname:			(string) nick name
			width:				(int) background image width
			height:				(int) background image height
		canvas: 	(object) canvas object where we draw a scene
		ctx2d: 		(object) drawing 2D context for canvas
		half: 		(int) name layot index
		background:	(image) background image
		gfxname:	(array) two name layouts
	*/
	var context = { params: params, gfxname: [], half: 1 };
	
	InitSceneElements(context);
	
	var canvas = context.canvas;// = document.getElementById(params.canvasId);
	var ctx2d  = context.ctx2d;//  = canvas.getContext("2d");
	
	// Initially fill canvas
	ctx2d.fillStyle = "rgb(100, 100, 100)";
	ctx2d.fillRect(0, 0, params.width, params.height);
	
	ParseGFX_OSPStyle(context, params.nickname);
	
	Q3GFX_ChangeBackground(context, params.backgroundImage);
	
	// Set blinking timer
	s_blinkingTimer = setTimeout(function() { TimerDispatcher(context); }, s_blinkingTimerInterval);
	
	return context;
}

function Q3GFX_ChangeNickname(context, nickname)
{
	context.params.nickname = nickname;
	ParseGFX_OSPStyle(context, context.params.nickname);
	UpdateScene(context);
}

function Q3GFX_ChangeBackground(context, image)
{
	AsyncLoadImage(context, image, OnLoadBackground);
}

function Q3GFX_ChangeMode(context, mode)
{
	//TODO: mode
	UpdateScene(context);
}

// ==================
//  Private stuff
// ==================

function InitSceneElements(context)
{
	var params = context.params;

	var root = document.getElementById(context.params.containerId);
	root.innerHTML = "";

	var container = document.createElement("div");
	container.style.width  = "" + (params.width - 10) + "px";
	container.style.border = "1px solid #333";
	container.style.borderBottom = "none";
	container.style.color  = "black";
	container.style.backgroundColor = "rgba(33, 33, 33, 0.3)";
	container.style.padding  = "5px";
	root.appendChild(container);

	// Top panel

	var panel = document.createElement("div");
	panel.style.height = "22px";

	// Nickname field
	var nickname = document.createElement("input");
	nickname.type = "text";
	nickname.value = "^1A^2n^3a^5r^6k^7i^1A^2n^3a^5r^6k^7"
	nickname.style.width  = "350px";
	nickname.style.height = "18px";
	nickname.style.fontFamily = "Consolas";
	nickname.style.fontSize = "18px";
	nickname.style.fontWeight = "bold";
	nickname.style.backgroundColor = "#999";
	nickname.style.border = "1px solid #666";
	panel.appendChild(nickname);

	// Mode menu
	var mode = document.createElement("select");
	mode.style.width  = "120px";
	mode.style.height = "20px";
	mode.style.fontFamily = "Consolas";
	mode.style.fontSize = "15px";
	mode.style.fontWeight = "bold";
	mode.style.backgroundColor = "#999";
	mode.style.border = "1px solid #666";
	mode.style.margin = "0px 0px 0px 10px";

	var option = document.createElement("option");
	option.innerText = "Default VQ3";
	mode.appendChild(option);
	
	option = document.createElement("option");
	option.innerText = "OSP Mode";
	option.selected = true;
	mode.appendChild(option);

	option = document.createElement("option");
	option.innerText = "CPMA Mode";
	mode.appendChild(option);

	panel.appendChild(mode);

	var mode = document.createElement("select");
	mode.style.width  = "120px";
	mode.style.height = "20px";
	mode.style.fontFamily = "Consolas";
	mode.style.fontSize = "15px";
	mode.style.fontWeight = "bold";
	mode.style.backgroundColor = "#999";
	mode.style.border = "1px solid #666";
	mode.style.margin = "0px 0px 0px 10px";

	option = document.createElement("option");
	option.innerText = "Q3DM6";
	option.selected = true;
	mode.appendChild(option);

	panel.appendChild(mode);

	// Add top panel
	container.appendChild(panel);

	// Bottom panel OSP

	panel = document.createElement("div");
	
	function makeButtonStyle(text)
	{
		var button = document.createElement("input");
		button.type = "button";
		button.value = text;
		button.style.padding  = "2px";
		button.style.fontFamily = "Consolas";
		button.style.fontSize = "11px";
		button.style.fontWeight = "bold";
		button.style.border = "1px solid #333";
		button.style.backgroundColor = "#666";
		button.style.margin = "7px 2px 2px 2px";
		return button;
	}

	var blink = makeButtonStyle("Blink");
	panel.appendChild(blink);

	var half1 = makeButtonStyle("Layot #1");
	panel.appendChild(half1);

	var half2 = makeButtonStyle("Layot #2");
	panel.appendChild(half2);

	var rgb = makeButtonStyle("RGB Front");
	panel.appendChild(rgb);

	var rgb2 = makeButtonStyle("RGB Back");
	panel.appendChild(rgb2);

	function makeColorButton(text, font, back)
	{
		var color = makeButtonStyle(text);
		color.style.backgroundColor = font;
		color.style.color = back;
		return color;
	}

	panel.appendChild(makeColorButton("^0", "black", "white"));
	panel.appendChild(makeColorButton("^1", "red", "white"));
	panel.appendChild(makeColorButton("^2", "green", "white"));
	panel.appendChild(makeColorButton("^3", "yellow", "black"));
	panel.appendChild(makeColorButton("^4", "blue", "white"));
	panel.appendChild(makeColorButton("^5", "aqua", "black"));
	panel.appendChild(makeColorButton("^6", "magenta", "white"));
	panel.appendChild(makeColorButton("^7", "white", "black"));
	panel.appendChild(makeColorButton("^8", "#F80", "black"));
	panel.appendChild(makeColorButton("^9", "#888", "white"));
	panel.appendChild(makeColorButton("^0", "black", "white"));
	
	container.appendChild(panel);

	// Bottom panel VQ3
	panel = document.createElement("div");
	panel.appendChild(makeColorButton("^0", "black", "white"));
	panel.appendChild(makeColorButton("^1", "red", "white"));
	panel.appendChild(makeColorButton("^2", "green", "white"));
	panel.appendChild(makeColorButton("^3", "yellow", "black"));
	panel.appendChild(makeColorButton("^4", "blue", "white"));
	panel.appendChild(makeColorButton("^5", "aqua", "black"));
	panel.appendChild(makeColorButton("^6", "magenta", "white"));
	panel.appendChild(makeColorButton("^7", "white", "black"));
	panel.appendChild(makeColorButton("^8", "#F80", "black"));
	panel.appendChild(makeColorButton("^9", "#888", "white"));
	panel.appendChild(makeColorButton("^0", "black", "white"));
	container.appendChild(panel);

	// Bottom panel CMPA
	panel = document.createElement("div");
	panel.appendChild(makeColorButton("^0", "black", "white"));
	panel.appendChild(makeColorButton("^1", "red", "white"));
	panel.appendChild(makeColorButton("^2", "green", "white"));
	panel.appendChild(makeColorButton("^3", "yellow", "black"));
	panel.appendChild(makeColorButton("^4", "blue", "white"));
	panel.appendChild(makeColorButton("^5", "aqua", "black"));
	panel.appendChild(makeColorButton("^6", "magenta", "white"));
	panel.appendChild(makeColorButton("^7", "white", "black"));
	panel.appendChild(makeColorButton("^8", "#F80", "black"));
	panel.appendChild(makeColorButton("^9", "#888", "white"));
	panel.appendChild(makeColorButton("^0", "black", "white"));

	panel.appendChild(makeColorButton("a", "#f00", "white"));
	panel.appendChild(makeColorButton("b", "#f40", "white"));
	panel.appendChild(makeColorButton("c", "#f80", "black"));
	panel.appendChild(makeColorButton("d", "#fc0", "black"));
	panel.appendChild(makeColorButton("e", "#ff0", "black"));
	panel.appendChild(makeColorButton("f", "#cf0", "black"));
	panel.appendChild(makeColorButton("g", "#8f0", "black"));
	panel.appendChild(makeColorButton("h", "#4f0", "black"));
	panel.appendChild(makeColorButton("i", "#0f0", "black"));
	panel.appendChild(makeColorButton("j", "#0f4", "black"));
	panel.appendChild(makeColorButton("k", "#0f8", "black"));
	panel.appendChild(makeColorButton("l", "#0fc", "black"));
	panel.appendChild(makeColorButton("m", "#0ff", "black"));
	panel.appendChild(makeColorButton("n", "#0cf", "black"));
	panel.appendChild(makeColorButton("o", "#08f", "white"));
	panel.appendChild(makeColorButton("p", "#04f", "white"));
	panel.appendChild(makeColorButton("q", "#00f", "white"));
	panel.appendChild(makeColorButton("r", "#40f", "white"));
	panel.appendChild(makeColorButton("s", "#80f", "black"));
	panel.appendChild(makeColorButton("t", "#c0f", "black"));
	panel.appendChild(makeColorButton("u", "#f0f", "white"));
	panel.appendChild(makeColorButton("v", "#f0c", "white"));
	panel.appendChild(makeColorButton("w", "#f08", "white"));
	panel.appendChild(makeColorButton("x", "#f04", "white"));
	panel.appendChild(makeColorButton("y", "#595959", "white"));
	panel.appendChild(makeColorButton("z", "#949494", "black"));
	
	container.appendChild(panel);


	var canvas = document.createElement("canvas"); 
	canvas.width  = params.width;
	canvas.height = params.height;
	canvas.style.border = "1px solid #333";
	root.appendChild(canvas);

	context.canvas = canvas;
	context.ctx2d  = canvas.getContext("2d");
}

function TimerDispatcher(context)
{	
	BlinkingTimer(context);
	HalfTextTimer(context);
	
	UpdateScene(context);
	
	s_blinkingTimer = setTimeout(function() { TimerDispatcher(context); }, s_blinkingTimerInterval);
}

var s_halfDisplayInterval = 0;

function HalfTextTimer(context)
{
	s_halfDisplayInterval += s_blinkingTimerInterval;
	if (s_halfDisplayInterval < 500)
		return;
	
	s_halfDisplayInterval = 0;
	context.half = (context.half != 1 ? 1 : 0);
}

//TODO: no globals should be
var s_blinkingOpaque = 1.0;
var s_blinkingIncreament = -0.05;

function BlinkingTimer(context)
{ // TODO: refactor that shit
	s_blinkingOpaque += s_blinkingIncreament;
	if (s_blinkingOpaque < 0.2)
	{
		s_blinkingIncreament = 0.04;
		s_blinkingOpaque = 0.2;
	}
	else if (s_blinkingOpaque < 0.4)
	{
		if (s_blinkingIncreament < 0)
			s_blinkingIncreament = -0.04;
		else
			s_blinkingIncreament = 0.05;
	}
	else if (s_blinkingOpaque > 0.95)
	{
		s_blinkingIncreament = -0.05;
		s_blinkingOpaque = 1.0;
	}
}

function OnLoadBackground(result)
{
	if (result.error != 'success')
		return;
	
	result.context.background = result.image;
	
	UpdateScene(result.context);
}

function UpdateScene(context)
{
	var ctx2d  = context.ctx2d;
	var params = context.params;
	
	// Draw background image
	if (context.hasOwnProperty("background"))
		ctx2d.drawImage(context.background, 0, 0, params.width, params.height);
	
	DrawNicknameBar(context, context.gfxname[context.half])
}

function DrawNicknameBar(context, gfx)
{
	var params = {
		x:context.params.width / 2,
		y:context.params.height / 6.0,
		size:40,
		shadow:true,
		center:true
	};
	
	// Uber-mega algo on a plate
	if (gfx.length > 22)
		params.size = params.size - ((gfx.length - 23) * 1.4);
	
	DrawGFXText(context, gfx, params);
}

function DrawGFXText(context, gfx, params)
{
	var ctx2d  = context.ctx2d;
	var spacing = params.size - (params.size / 8);
	var offset = params.size / 15;
	
	if (offset == 0)
		offset = 1;
	
	ctx2d.font = "700 " + params.size + "px Verdana";
	ctx2d.textAlign = "center";
	
	var x = params.x;
	if (params.center)
		x = (context.params.width - (spacing * gfx.length) + spacing) / 2;
	
	for (var i = 0; i < gfx.length; i++)
	{
		var entry = gfx[i];
		
		var opaque = (entry.blink ? s_blinkingOpaque : 1.0);
		
		if (params.shadow)
		{
			ctx2d.fillStyle = ConvertVectorToRGBA(entry.backgroundColor, opaque);
			ctx2d.fillText(entry.symbol, x + offset + (i * spacing), params.y + offset); 
		}
		
		ctx2d.fillStyle = ConvertVectorToRGBA(entry.color, opaque);
		ctx2d.fillText(entry.symbol, x + (i * spacing), params.y); 
	}
}

function ParseGFX_VQ3Style(context, nickname)
{
	// There is one name layot
	context.gfxname[0] = context.gfxname[1] = ParseGFX(nickname, 0);
}

function ParseGFX_OSPStyle(context, nickname)
{
	// There are two name layots
	context.gfxname[0] = ParseGFX(nickname, 0);
	context.gfxname[1] = ParseGFX(nickname, 1);
}

function ParseGFX(text, half)
{
	var command = false;
	var blinking = false;
	var overwrite = false;
	var skip = false;
	var colors = { 
		front:[255, 255, 255], 
		back:[0, 0, 0], 
		custom:false 
	};
	var gfxs = [];
	
	function putCharToGFXArray()
	{
		gfxs[a++] = {
			symbol: chr,
			color: colors.front,
			backgroundColor: colors.back,
			blink: blinking
		};
	}
	
	for (var i = 0, a = 0; i < text.length; i++)
	{
		var chr = text.charAt(i);
		
		if (overwrite)
		{
			overwrite = false;
			gfxs.pop(), a--;
		}
		
		if (command)
		{
			if (skip && chr != 'N'&& chr != 'f'&& chr != 'F')
				continue;
				
			switch (chr)
			{
				case 'b':
				case 'B':
					blinking = true;
					if (colors.custom)
					{
						colors.front = colors.back;
						colors.custom = false;
					}
					break;
				case 'f':
					skip = (half == 1);
					break;
				case 'F':
					skip = (half == 0);
					break;
				case 'n':
					blinking = false;
					if (colors.custom)
					{
						colors.front = colors.back;
						colors.custom = false;
					}
				case 'N':
					blinking = false;
					if (colors.custom)
					{
						colors.front = colors.back;
						colors.custom = false;
					}
					skip = false;
					break;
				case 'x':
				case 'X':
					var rgbtext = text.substring(i + 1, i + 7);
					if (ValidateRGBText(rgbtext))
					{
						colors.back = ParseRGBToVector(rgbtext, i);
						colors.custom = true;
						i += 6;
					}
					break;
				case '^':
					putCharToGFXArray();
					putCharToGFXArray();
					overwrite = true;
					continue;
				default:
					if (/^\d+$/.test(chr))
					{	
						colors.front = ConvertCharToColorVector(chr, colors.front);
						colors.custom = false;
					}
			};
			
			command = false;
			continue;
		}
		else
		{
			if (chr =='^')
			{
				command = true;
				continue;
			}
		}
		
		if (skip)
			continue;
		
		putCharToGFXArray();
	}
	
	return gfxs;
}

function ConvertCharToColorVector(chr, dflt)
{
	var color = dflt;
	
	switch (chr)
	{
		case '0':
			return [  0,   0,   0];
		case '1':
			return [255,   0,   0];
		case '2':
			return [  0, 255,   0];
		case '3':
			return [255, 255,   0];
		case '4':
			return [  0,   0, 255];
		case '5':
			return [  0, 255, 255];
		case '6':
			return [255,   0, 255];
		case '7':
			return [255, 255, 255];
		case '8':
			return [255, 128,   0];
		case '9':
			return [128, 128, 128];
		default:
			break;
	}
	
	return color;
}

function ValidateRGBText(text)
{
	if (text.length != 6)
		return false;
	
	var re = /[0-9A-Fa-f]{6}/g;
	return re.test(text);
}

function ParseRGBToVector(rgbtext)
{
	return [
		parseInt( rgbtext.substring(0, 2), 16 ), 
		parseInt( rgbtext.substring(2, 4), 16 ), 
		parseInt( rgbtext.substring(4, 6), 16 )
	];
}

function ConvertVectorToRGBA(vector, alpha)
{
	return "rgba(" + vector[0] + "," + vector[1] + "," + vector[2] + "," + alpha + ")";
}

function AsyncLoadImage(context, image, callback) 
{
	var seconds = 0;
	var timeout = 10;
	var completed = false;
	
	function onImageLoad()
	{
		if (completed) 
			return;
		
		callback({context:context, error:'success', image:imageObject});
		completed = true;
	}
	
	function onTimeout()
	{
		if (completed) 
			return;
		
		if (seconds >= timeout)
		{
			callback({context:context, error:'timeout'});
			completed = true;
			return;
		}
		
		seconds++;
		callback.onTimeout = setTimeout(onTimeout, 1000);
	}
	
	var imageObject = new Image();
	imageObject.onload = onImageLoad;
	imageObject.src = image;
}

