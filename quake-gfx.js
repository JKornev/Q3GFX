
var s_blinkingTimer;
var s_blinkingTimerInterval = 50;

// ==================
//  Public interface
// ==================

function Q3GFX_Initialize(params)
{
	var context = { params: params };
	
	var canvas = context.canvas = document.getElementById(params.canvasId);
	var ctx2d  = context.ctx2d  = canvas.getContext("2d");
	
	// Initially fill canvas
	ctx2d.fillStyle = "rgb(100, 100, 100)";
	ctx2d.fillRect(0, 0, params.width, params.height);
	
	context.gfxname = ParseGFX_OSPStyleNew(params.nickname);
	context.half = 1;
	
	Q3GFX_ChangeBackground(context, params.backgroundImage);
	
	// Set blinking timer
	s_blinkingTimer = setTimeout(function() { TimerDispatcher(context); }, s_blinkingTimerInterval);
	
	return context;
}

function Q3GFX_ChangeNickname(context, nickname)
{
	context.params.nickname = nickname;
	context.gfxname = ParseGFX_OSPStyleNew(nickname);
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
	
	DrawNicknameBar(context, context.gfxname)
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
	
	gfx = FilterGFXTextByHalf(gfx, context.half);
	
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

function FilterGFXTextByHalf(gfx, half)
{
	var newGFX = [];
	for (var i = 0, a = 0; i < gfx.length; i++)
	{
		var displayHalf = gfx[i].displayHalf;
		if (displayHalf == half)
			newGFX[a++] = gfx[i];
	}
	return newGFX;
}

function ParseGFX_OSPStyleNew(text)
{
	//TODO: 
	// - whitespaces filtering
	// - special cases ^^y
	var command = false;
	var blinking = false;
	var customColor = false;
	var gfxs = [];
	
	var index = 0;
	var global = true;
					
	var colors = [
		{ front:[255, 255, 255], back:[0, 0, 0], custom:false },
		{ front:[255, 255, 255], back:[0, 0, 0], custom:false }
	];
	
	function setFrontColor(front)
	{
		colors[index].front = front;
		if (global)
			colors[index == 0 ? 1 : 0].front = front;
	}
	
	function setBackColor(back)
	{
		colors[index].back = back;
		if (global)
			colors[index == 0 ? 1 : 0].back = back;
	}
	
	function setCustomFrontColor()
	{
		for (var b = 0; b < 2; b++)
			if (colors[b].custom)
			{
				colors[b].front = colors[b].back;
				colors[b].custom = false;
			}
	}
	
	function addGfx()
	{
		for (var b = 0; b < 2; b++)
		{
			//var inx = ((!global && b != index) ? 0 : b);
			if (!global && b != index)
				continue;
			
			gfxs[a++] = {
				symbol: chr,
				color: colors[b].front,
				backgroundColor: colors[b].back,
				blink: blinking,
				displayHalf: b
			};
		}
	}
	
	for (var i = 0, a = 0; i < text.length; i++)
	{
		var chr = text.charAt(i);
		
		if (command)
		{
			if (chr == 'b' || chr == 'B')
			{
				blinking = true;
				
				setCustomFrontColor();
			}
			else if (chr =='F')
			{
				index = 1;
				global = false;
			}
			else if (chr =='f')
			{
				index = 0;
				global = false;
			}
			else if (chr =='N' || chr =='n')
			{
				blinking = false;
				
				//Are they friends?
				setCustomFrontColor();
				
				if (chr =='N')
				{
					global = true;
					index = 0;
				}
			}
			else if (chr =='x' || chr =='X')
			{
				var rgbtext = text.substring(i + 1, i + 7);
				if (ValidateRGBText(rgbtext))
				{
					setBackColor( ParseRGBToVector(rgbtext, i) );
					colors[index].custom = true;
					i += 6;
				}
			}
			else if (chr =='^')
			{
				//Special case like in x0r^^y
				addGfx();
				addGfx();
				a--;
			}
			else
			{
				setFrontColor( ConvertCharToColorVector(chr) );
			}
			
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
		
		addGfx();
		/*for (var b = 0; b < 2; b++)
		{
			//var inx = ((!global && b != index) ? 0 : b);
			if (!global && b != index)
				continue;
			
			gfxs[a++] = {
				symbol: chr,
				color: colors[b].front,
				backgroundColor: colors[b].back,
				blink: blinking,
				displayHalf: b
			};
		}*/
	}
	
	return gfxs;
}

/*function ParseGFX_OSPStyle(text)
{ //TODO: delete me
	var command = false;
	var blinking = false;
	var customColor = false;
	var gfxs = [];
	var opaque = s_blinkingOpaque;
	//var color = [255, 255, 255];
	//var backgroundColor = [0, 0, 0];
	//var globalMainColor = color;
	//var globalBackgroundColor = backgroundColor;
	var index = 0; 	// 0 - means global display 
					// 1 - first parf of second
					// 2 - second part of second

	//TODO: implement global color for ^F - ^f cases
	var colors = [];
	for (var i = 0; i < 3; i++)
		colors[i] = {front:[255, 255, 255], back:[0, 0, 0], custom:false};
	
	function setFrontColor(front)
	{
		if (index == 0)
		{
			colors[0].front = front;
			for (var b = 1; b < 3; b++)
				if (!colors[index].custom)
					colors[b].front = front;
		}
		else
		{
			colors[index].front = front;
			colors[index].custom = true;
		}
	}
	
	function setBackColor(back)
	{
		if (index == 0)
		{
			colors[0].back = back;
			for (var i = 1; i < 3; i++)
				if (!colors[index].custom)
					colors[i].back = back;
		}
		else
		{
			colors[index].back = back;
			colors[index].custom = true;
		}
	}
	
	function switchIndex(inx)
	{
		index = inx;
		var copy = (colors[inx].custom ? inx : 0);
		setFrontColor(colors[copy].front);
		setBackColor(colors[copy].back);
	}
		
	for (var i = 0, a = 0; i < text.length; i++)
	{
		var chr = text.charAt(i);
		var gfx =
		{
			symbol: chr,
			color: colors[index].front,
			backgroundColor: colors[index].back,
			blink: blinking,
			displayHalf: index
		};

		if (command)
		{
			if (chr == 'b' || chr == 'B')
			{
				blinking = true;
				
				if (customColor)
				{
					//color = backgroundColor;
					setFrontColor(colors[index].back);
					customColor = false;
				}
			}
			else if (chr =='F')
			{
				//index = 1;
				//color = global;
				//setFrontColor(colors[0].front);
				//setBackColor(colors[0].back);
				switchIndex(1);
			}
			else if (chr =='f')
			{
				//index = 2;
				//color = global;
				//setFrontColor(colors[0].front);
				//setBackColor(colors[0].back);
				switchIndex(2);
			}
			else if (chr =='N' || chr =='n')
			{
				blinking = false;
				
				if (chr =='N')
					index = 0;
				//Are they friends?
				if (customColor)
				{
					//color = backgroundColor;
					setFrontColor(colors[index].back);
					customColor = false;
				}
			}
			else if (chr =='x' || chr =='X')
			{
				var rgbtext = text.substring(i + 1, i + 7);
				if (ValidateRGBText(rgbtext))
				{
					//backgroundColor = ParseRGBToVector(rgbtext, i);
					setBackColor(ParseRGBToVector(rgbtext, i));
					customColor = true;
					i += 6;
				}
			}
			else if (chr =='^')
			{
				//Special case like in x0r^^y
			}
			else
			{
				//color = ConvertCharToColorVector(chr);
				setFrontColor(ConvertCharToColorVector(chr));
			}
			
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
		
		gfxs[a++] = gfx;
	}
	
	return gfxs;
}*/

function ConvertCharToColorVector(chr)
{
	var color = [255, 255, 255];
	
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

