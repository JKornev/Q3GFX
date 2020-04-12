// ====================
//   Public interface

function Q3GFX_Initialize(params)
{
	/*
	context stucture tree
		params: 
			canvasId:			(string) canvas id
			?backgroundImage:	(string) background image path
			nickname:			(string) nick name
			width:				(int) background image width
			height:				(int) background image height
			modes:				(array)
				mode:			(string) mode name (vq3, osp, cpma)
				maps:			(array) background images
					image:		(string) background image path
					name:		(string) map name
		?canvas: 				(object) canvas object where we draw a scene
		ctx2d: 					(object) drawing 2D context for canvas
		half: 					(int) name layot index
		?background:				(image) background image
		gfxname:				(array) two name layouts
		timer 					(object) blinking timer
		interval:				(int) timer interval
		counter:				(int) 
		opaque:					(int)
		opaqueStep: 			(int)
		ui:						(dict)
			container:			(div)
			panel:				(div)
			panel2:				(div) 
			canvas:				(canvas) 
			nickname:			(input) 
			mode:				(select) 
			background:			(select) 
		modes:					(array)
		current:				(dict) current mode
			ui:					(dict) UI elements
			background:			(array)
				image:			(image)
				path:			(string)
				name:			(string)
			
	*/
	var context = { 
		params: params,
		gfxname: [], 
		half:1,
		nickname: params.nickname
	};
	
	InitializeUI(context, params);
	InitializeModes(context, params, context.ui);

	ReparseNickname(context);

	// Set blinking timer
	StartScheduler(context);
	
	return context;
}

// ====================
//   Scheduler 

function StartScheduler(context)
{
	context.interval   =  50;
	context.counter    =  0;
	context.opaque     =  1.0;
	context.opaqueStep = -0.05;
	context.timer = setTimeout(function() { TimerDispatcher(context); }, context.interval);
}

function TimerDispatcher(context)
{	
	ProceedBlinking(context);
	ProceedLayots(context);
	
	UpdateScene(context);
	
	context.timer = setTimeout(function() { TimerDispatcher(context); }, context.interval);
}

function ProceedLayots(context)
{
	context.counter += context.interval;
	if (context.counter < 500)
		return;
	
	context.counter = 0;
	context.half = (context.half != 1 ? 1 : 0);
}

function ProceedBlinking(context)
{ // TODO: refactor this shit
	var opaque = context.opaque;
	var opaqueStep = context.opaqueStep;

	opaque += opaqueStep;
	if (opaque < 0.2)
	{
		opaqueStep = 0.04;
		opaque = 0.2;
	}
	else if (opaque < 0.4)
	{
		if (opaqueStep < 0)
			opaqueStep = -0.04;
		else
			opaqueStep = 0.05;
	}
	else if (opaque > 0.95)
	{
		opaqueStep = -0.05;
		opaque = 1.0;
	}

	context.opaque = opaque;
	context.opaqueStep = opaqueStep;
}

// ====================
//   Panel view

function InitializeUI(context, params)
{
	var ui = context.ui = {};
	var root = document.getElementById(params.containerId);
	root.innerHTML = "";

	CreateContainer(ui, params, root);
	CreateTopPanel(ui, params);
	CreateModePanel(ui, params);
	CreateCanvas(ui, params);
	PrepareCanvas(context, ui);

	ui.nickname.oninput = function() { OnChangeNickname(context); };
	ui.mode.onchange = function() { OnChangeMode(context); };
	ui.background.onchange = function() { OnChangeBackground(context); };
}

function CreateContainer(ui, params, root)
{
	var container = ui.container = document.createElement("div");
	container.style.width = "" + (params.width) + "px";
	container.style.border = "1px solid #333";
	container.style.color = "black";
	container.style.backgroundColor = "rgba(33, 33, 33, 0.3)";
	container.style.padding = "0px";
	container.style.margin = "0px";
	root.appendChild(container);
}

function CreateTopPanel(ui, params)
{
	var panel = ui.panel = document.createElement("div");
	panel.style.height = "22px";
	panel.style.padding  = "5px";

	var nickname = ui.nickname = document.createElement("input");
	nickname.type = "text";
	nickname.value = params.nickname;
	nickname.style.width  = "350px";
	nickname.style.height = "18px";
	nickname.style.fontFamily = "Consolas";
	nickname.style.fontSize = "18px";
	nickname.style.fontWeight = "bold";
	nickname.style.backgroundColor = "#999";
	nickname.style.border = "1px solid #666";
	panel.appendChild(nickname);

	var mode = ui.mode = MakeSelect();
	panel.appendChild(mode);

	var background = ui.background = MakeSelect();
	panel.appendChild(background);

	ui.container.appendChild(panel);
}

function CreateModePanel(ui, params)
{
	var panel = ui.panel2 = document.createElement("div");
	panel.style.height = "22px";
	panel.style.padding  = "0px 0px 5px 5px";
	ui.container.appendChild(panel);
}

function CreateCanvas(ui, params)
{
	var canvas = ui.canvas = document.createElement("canvas"); 
	canvas.width  = params.width;
	canvas.height = params.height;
	canvas.style.padding = "0px";
	canvas.style.margin = "0px 0px -4px 0px";
	ui.container.appendChild(canvas);
}

function PrepareCanvas(context, ui)
{
	context.canvas = ui.canvas;
	var ctx2d = context.ctx2d = ui.canvas.getContext("2d");
	ctx2d.fillStyle = "rgb(100, 100, 100)";
	ctx2d.fillRect(0, 0, params.width, params.height);
}

function MakeSelect()
{
	var select = document.createElement("select");
	select.style.width  = "130px";
	select.style.height = "20px";
	select.style.fontFamily = "Consolas";
	select.style.fontSize = "15px";
	select.style.fontWeight = "bold";
	select.style.backgroundColor = "#999";
	select.style.border = "1px solid #666";
	select.style.margin = "0px 0px 0px 10px";
	return select;
}

function MakeOption(text)
{
	var option = document.createElement("option");
	option.innerText = text;
	return option;
}

function MakeButton(text)
{
	var button = document.createElement("input");
	button.type = "button";
	button.value = text;
	button.style.padding = "2px";
	button.style.fontFamily = "Consolas";
	button.style.fontSize = "11px";
	button.style.fontWeight = "bold";
	button.style.border = "1px solid #333";
	button.style.backgroundColor = "#666";
	button.style.margin = "0px 3px 0px 2px";
	return button;
}

function MakeColoredButton(text, font, back)
{
	var color = MakeButton(text);
	color.style.backgroundColor = font;
	color.style.color = back;
	return color;
}

function MakePanel2Div()
{
	var div = document.createElement("div");
	div.style.padding = "0px";
	div.style.margin = "0px";
	div.style.display = 'none';
	return div;
}

// ====================
//   Controls

function OnChangeNickname(context)
{
	context.nickname = context.ui.nickname.value;
	ReparseNickname(context);
	UpdateScene(context);
}

function OnChangeMode(context)
{
	SwitchToSelectedMode(context);
	LoadCurrentMode(context);
}

function OnChangeBackground(context)
{
	SwitchToSelectedBackground(context);
	UpdateScene(context);
}

function SwitchToSelectedMode(context)
{
	var selected = context.ui.mode.value;
	var modes = context.modes;
	
	for (var i = 0; i < modes.length; i++)
	{
		if (modes[i].name == selected)
		{
			if (modes[i] == context.current)
				return;

			context.current.ui.div.style.display = 'none';
			context.current = modes[i];
			break;
		}
	}
}

function SwitchToSelectedBackground(context)
{
	var selected = context.ui.background.value;
	var background = context.current.background;

	for (var i = 0; i < background.length; i++)
	{
		if (background[i].name == selected)
		{
			if (background[i].hasOwnProperty("image"))
			{
				context.background = background[i].image;
				return;
			}
		}
	}
}

function EnsureBackgroundImageLoaded(context)
{
	if (context.hasOwnProperty("background"))
		return;
	
	SwitchToSelectedBackground(context);
}

// ====================
//   Modes

function InitializeModes(context, params, ui)
{
	context.modes = [];

	for (var i = 0, a = 0; i < params.modes.length; i++)
	{
		var settings = params.modes[i];
		var mode = { ui:{div:MakePanel2Div()}, background:[], index:a };

		if (settings.mode == "vq3")
		{
			mode.name = "VQ3 (default)";
			mode.parser = ParseGFX_VQ3Style;
			CreateVQ3Panel(mode);
		}
		else if (settings.mode == "osp")
		{
			mode.name = "OSP Mode";
			mode.parser = ParseGFX_OSPStyle;
			CreateOSPPanel(mode);
		}
		else if (settings.mode == "cpma")
		{
			mode.name = "CPMA Mode";
			mode.parser = ParseGFX_CPMAStyle;
			CreateCPMAPanel(mode);
		}
		else
		{
			continue;
		}
		
		context.ui.panel2.appendChild(mode.ui.div);

		for (var b = 0; b < settings.maps.length; b++)
		{
			mode.background[b] = { 
				path: settings.maps[b].image, 
				name: settings.maps[b].name 
			};

			function OnLoadImageForMode(result)
			{
				if (result.error != 'success')
					return;
				
				result.context.image = result.image;
				EnsureBackgroundImageLoaded(context);
			}

			AsyncLoadImage(mode.background[b], settings.maps[b].image, OnLoadImageForMode);
		}
		
		context.ui.mode.appendChild(MakeOption(mode.name));

		if (settings.hasOwnProperty("default") && settings.default)
			context.current = mode;

		context.modes[a++] = mode;
	}

	if (!context.hasOwnProperty("current"))
	{
		if (!context.modes.length)
			alert("Error, modules aren't configurated");
		context.current = context.modes[0];
	}

	context.ui.mode.selectedIndex = context.current.index;
	LoadCurrentMode(context);
}

function LoadCurrentMode(context)
{
	var mode = context.current;
	var background = mode.background;

	// Display current mode bar
	mode.ui.div.style.display = 'block';

	// Load new background list
	context.ui.background.innerHTML = "";
	for (var i = 0; i < background.length; i++)
		context.ui.background.appendChild(MakeOption(background[i].name));

	SwitchToSelectedBackground(context);
	ReparseNickname(context);
}

function CreateVQ3Panel(mode)
{
	var panel = mode.ui.div;
	panel.appendChild(MakeColoredButton("^0", "black", "white"));
	panel.appendChild(MakeColoredButton("^1", "red", "white"));
	panel.appendChild(MakeColoredButton("^2", "green", "white"));
	panel.appendChild(MakeColoredButton("^3", "yellow", "black"));
	panel.appendChild(MakeColoredButton("^4", "blue", "white"));
	panel.appendChild(MakeColoredButton("^5", "aqua", "black"));
	panel.appendChild(MakeColoredButton("^6", "magenta", "white"));
	panel.appendChild(MakeColoredButton("^7", "white", "black"));
}

function CreateOSPPanel(mode)
{
	var panel = mode.ui.div;

	panel.appendChild(MakeColoredButton("^0", "black", "white"));
	panel.appendChild(MakeColoredButton("^1", "red", "white"));
	panel.appendChild(MakeColoredButton("^2", "green", "white"));
	panel.appendChild(MakeColoredButton("^3", "yellow", "black"));
	panel.appendChild(MakeColoredButton("^4", "blue", "white"));
	panel.appendChild(MakeColoredButton("^5", "aqua", "black"));
	panel.appendChild(MakeColoredButton("^6", "magenta", "white"));
	panel.appendChild(MakeColoredButton("^7", "white", "black"));
	panel.appendChild(MakeColoredButton("^8", "#F80", "black"));
	panel.appendChild(MakeColoredButton("^9", "#888", "white"));
	panel.appendChild(MakeColoredButton("^0", "black", "white"));

	var blink = MakeButton("Blink");
	panel.appendChild(blink);

	var half1 = MakeButton("Layot #1");
	panel.appendChild(half1);

	var half2 = MakeButton("Layot #2");
	panel.appendChild(half2);

	var rgb = MakeButton("RGB Front");
	panel.appendChild(rgb);

	var rgb2 = MakeButton("RGB Back");
	panel.appendChild(rgb2);
}

function CreateCPMAPanel(mode)
{
	var panel = mode.ui.div;
	panel.appendChild(MakeColoredButton("^0", "black", "white"));
	panel.appendChild(MakeColoredButton("^1", "red", "white"));
	panel.appendChild(MakeColoredButton("^2", "green", "white"));
	panel.appendChild(MakeColoredButton("^3", "yellow", "black"));
	panel.appendChild(MakeColoredButton("^4", "blue", "white"));
	panel.appendChild(MakeColoredButton("^5", "aqua", "black"));
	panel.appendChild(MakeColoredButton("^6", "magenta", "white"));
	panel.appendChild(MakeColoredButton("^7", "#BBB", "white"));
	panel.appendChild(MakeColoredButton("^8", "#888", "black"));
	panel.appendChild(MakeColoredButton("^9", "#77C", "white"));
	panel.appendChild(MakeColoredButton("^0", "black", "white"));
	panel.appendChild(MakeColoredButton("a", "#f00", "white"));
	panel.appendChild(MakeColoredButton("b", "#f40", "white"));
	panel.appendChild(MakeColoredButton("c", "#f80", "black"));
	panel.appendChild(MakeColoredButton("d", "#fc0", "black"));
	panel.appendChild(MakeColoredButton("e", "#ff0", "black"));
	panel.appendChild(MakeColoredButton("f", "#cf0", "black"));
	panel.appendChild(MakeColoredButton("g", "#8f0", "black"));
	panel.appendChild(MakeColoredButton("h", "#4f0", "black"));
	panel.appendChild(MakeColoredButton("i", "#0f0", "black"));
	panel.appendChild(MakeColoredButton("j", "#0f4", "black"));
	panel.appendChild(MakeColoredButton("k", "#0f8", "black"));
	panel.appendChild(MakeColoredButton("l", "#0fc", "black"));
	panel.appendChild(MakeColoredButton("m", "#0ff", "black"));
	panel.appendChild(MakeColoredButton("n", "#0cf", "black"));
	panel.appendChild(MakeColoredButton("o", "#08f", "white"));
	panel.appendChild(MakeColoredButton("p", "#04f", "white"));
	panel.appendChild(MakeColoredButton("q", "#00f", "white"));
	panel.appendChild(MakeColoredButton("r", "#40f", "white"));
	panel.appendChild(MakeColoredButton("s", "#80f", "black"));
	panel.appendChild(MakeColoredButton("t", "#c0f", "black"));
	panel.appendChild(MakeColoredButton("u", "#f0f", "white"));
	panel.appendChild(MakeColoredButton("v", "#f0c", "white"));
	panel.appendChild(MakeColoredButton("w", "#f08", "white"));
	panel.appendChild(MakeColoredButton("x", "#f04", "white"));
	panel.appendChild(MakeColoredButton("y", "#666", "white"));
	panel.appendChild(MakeColoredButton("z", "#aaa", "black"));
}

// ====================
//   OLD STUFF

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
		
		var opaque = (entry.blink ? context.opaque : 1.0);
		
		if (params.shadow)
		{
			ctx2d.fillStyle = ConvertVectorToRGBA(entry.backgroundColor, opaque);
			ctx2d.fillText(entry.symbol, x + offset + (i * spacing), params.y + offset); 
		}
		
		ctx2d.fillStyle = ConvertVectorToRGBA(entry.color, opaque);
		ctx2d.fillText(entry.symbol, x + (i * spacing), params.y); 
	}
}

function ReparseNickname(context)
{
	context.current.parser(context, context.nickname);
}

function ParseGFX_VQ3Style(context, nickname)
{
	// There is one name layot
	context.gfxname[0] = context.gfxname[1] = ParseGFX_VQ3(nickname);
}

function ParseGFX_OSPStyle(context, nickname)
{
	// There are two name layots
	context.gfxname[0] = ParseGFX_OSP(nickname, 0);
	context.gfxname[1] = ParseGFX_OSP(nickname, 1);
}

function ParseGFX_CPMAStyle(context, nickname)
{
	// There is one name layot
	context.gfxname[0] = context.gfxname[1] = ParseGFX_CPMA(nickname);
}

function ParseGFX_VQ3(text)
{
	var command = false;
	var overwrite = false;
	var color = [255, 255, 255];
	var gfxs = [];
	
	function putCharToGFXArray()
	{
		gfxs[a++] = {
			symbol: chr,
			color: color,
			backgroundColor: [0, 0, 0],
			blink: false
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
			switch (chr)
			{
				case '^':
					putCharToGFXArray();
					putCharToGFXArray();
					overwrite = true;
					continue;
				default:
					if (/^\d+$/.test(chr))
						color = ConvertNumberToVQ3ColorVector(chr, color);
					else
						color = ConvertCharToVQ3ColorVector(chr, color);
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
		
		putCharToGFXArray();
	}
	
	return gfxs;
}

function ParseGFX_OSP(text, half)
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
						colors.front = ConvertNumberToOSPColorVector(chr, colors.front);
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

function ParseGFX_CPMA(text)
{
	var command = false;
	var overwrite = false;
	var color = [255, 255, 255];
	var gfxs = [];
	
	function putCharToGFXArray()
	{
		gfxs[a++] = {
			symbol: chr,
			color: color,
			backgroundColor: [0, 0, 0],
			blink: false
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
			switch (chr)
			{
				case '^':
					putCharToGFXArray();
					putCharToGFXArray();
					overwrite = true;
					continue;
				default:
					if (/^[a-zA-Z\d]$/.test(chr))
						color = ConvertCharToCPMAColorVector(chr, color);
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
		
		putCharToGFXArray();
	}
	
	return gfxs;
}

function ConvertNumberToVQ3ColorVector(chr, dflt)
{
	var color = dflt;
	
	switch (chr)
	{
		case '0':
		case '1':
		case '9':
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
		case '8':
			return [255, 255, 255];
		default:
			break;
	}
	
	return color;
}

function ConvertCharToVQ3ColorVector(chr, dflt)
{
	//TODO: strange case ^zz^yy^xx and ^xx^yy^zz
	var color = dflt;
	var ascii = chr.charCodeAt(0);
	var number = 0;

	if (/^[A-Z]$/.test(chr))
	{
		number = ascii - 'A'.charCodeAt(0);
	}
	else if (/^[a-z]$/.test(chr))
	{
		number = ascii - 'a'.charCodeAt(0);
	}
	else
	{
		return dflt;
	}

	number = (number % 8) + 1;

	return ConvertNumberToVQ3ColorVector("" + number, dflt)
}

function ConvertNumberToOSPColorVector(chr, dflt)
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

function ConvertCharToCPMAColorVector(chr, dflt)
{
	var color = dflt;
	/*	panel.appendChild(MakeColoredButton("^0", "black", "white"));
	panel.appendChild(MakeColoredButton("^1", "red", "white"));
	panel.appendChild(MakeColoredButton("^2", "green", "white"));
	panel.appendChild(MakeColoredButton("^3", "yellow", "black"));
	panel.appendChild(MakeColoredButton("^4", "blue", "white"));
	panel.appendChild(MakeColoredButton("^5", "aqua", "black"));
	panel.appendChild(MakeColoredButton("^6", "magenta", "white"));
	panel.appendChild(MakeColoredButton("^7", "#BBB", "white"));
	panel.appendChild(MakeColoredButton("^8", "#888", "black"));
	panel.appendChild(MakeColoredButton("^9", "#77C", "white"));
	panel.appendChild(MakeColoredButton("^0", "black", "white"));
	panel.appendChild(MakeColoredButton("a", "#f00", "white"));
	panel.appendChild(MakeColoredButton("b", "#f40", "white"));
	panel.appendChild(MakeColoredButton("c", "#f80", "black"));
	panel.appendChild(MakeColoredButton("d", "#fc0", "black"));
	panel.appendChild(MakeColoredButton("e", "#ff0", "black"));
	panel.appendChild(MakeColoredButton("f", "#cf0", "black"));
	panel.appendChild(MakeColoredButton("g", "#8f0", "black"));
	panel.appendChild(MakeColoredButton("h", "#4f0", "black"));
	panel.appendChild(MakeColoredButton("i", "#0f0", "black"));
	panel.appendChild(MakeColoredButton("j", "#0f4", "black"));
	panel.appendChild(MakeColoredButton("k", "#0f8", "black"));
	panel.appendChild(MakeColoredButton("l", "#0fc", "black"));
	panel.appendChild(MakeColoredButton("m", "#0ff", "black"));
	panel.appendChild(MakeColoredButton("n", "#0cf", "black"));
	panel.appendChild(MakeColoredButton("o", "#08f", "white"));
	panel.appendChild(MakeColoredButton("p", "#04f", "white"));
	panel.appendChild(MakeColoredButton("q", "#00f", "white"));
	panel.appendChild(MakeColoredButton("r", "#40f", "white"));
	panel.appendChild(MakeColoredButton("s", "#80f", "black"));
	panel.appendChild(MakeColoredButton("t", "#c0f", "black"));
	panel.appendChild(MakeColoredButton("u", "#f0f", "white"));
	panel.appendChild(MakeColoredButton("v", "#f0c", "white"));
	panel.appendChild(MakeColoredButton("w", "#f08", "white"));
	panel.appendChild(MakeColoredButton("x", "#f04", "white"));
	panel.appendChild(MakeColoredButton("y", "#666", "white"));
	panel.appendChild(MakeColoredButton("z", "#aaa", "black")); */
	switch (chr)
	{
		case '0': return [  0,   0,   0];
		case '1': return [255,   0,   0];
		case '2': return [  0, 255,   0];
		case '3': return [255, 255,   0];
		case '4': return [  0,   0, 255];
		case '5': return [  0, 255, 255];
		case '6': return [255,   0, 255];
		case '7': return [0xB0, 0xB0, 0xB0];
		case '8': return [128, 128, 128];
		case '9': return [112, 112, 192];

		case 'a': return [255,   0,   0];
		case 'b': return [255,  64,   0];
		case 'c': return [255, 128,   0];
		case 'd': return [255, 192,   0];
		case 'e': return [255, 255,   0];
		case 'f': return [192, 255,   0];
		case 'g': return [128, 255,   0];
		case 'h': return [ 64, 255,   0];
		case 'i': return [  0, 255,   0];
		case 'j': return [  0, 255,  64];
		case 'k': return [  0, 255, 128];
		case 'l': return [  0, 255, 192];
		case 'm': return [  0, 255, 255];
		case 'n': return [  0, 192, 255];
		case 'o': return [  0, 128, 255];
		case 'p': return [  0,  64, 255];
		case 'q': return [  0,   0, 255];
		case 'r': return [ 64,   0, 255];
		case 's': return [128,   0, 255];
		case 't': return [192,   0, 255];
		case 'u': return [255,   0, 255];
		case 'v': return [255,   0, 192];
		case 'w': return [255,   0, 128];
		case 'x': return [255,   0,  64];
		case 'y': return [196, 196, 196];
		case 'z': return [160, 160, 160];
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

