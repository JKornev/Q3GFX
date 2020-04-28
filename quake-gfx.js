// ====================
//   Public interface

function Q3GFX_Initialize(params)
{
    /*
    context stucture tree
        params:
            resources:           (string) path to a dir with images
            symbolsMap:          (string) symbols map
            nickname:            (string) nick name
            width:               (int) background image width
            height:              (int) background image height
            modes:               (array)
                mode:            (string) mode name (vq3, osp, cpma)
                maps:            (array) background images
                    image:       (string) background image path
                    name:        (string) map name
        ctx2d:                   (object) drawing 2D context for canvas
        half:                    (int) name layer index
        background:              (image) current background image
        symbols:                 (image) image-map of symbols
        map:                     (array) front and background symbols map context
            canvas:
            ctx2d:
            color:
        gfxname:                 (array) two name layouts
        timer                    (object) blinking timer
        interval:                (int) timer interval
        counter:                 (int) 
        opaque:                  (int)
        opaqueStep:              (int)
        ui:                      (dict)
            container:           (div)
            panel:               (div)
            panel2:              (div) 
            canvas:              (canvas) 
            nickname:            (input) 
            mode:                (select) 
            background:          (select) 
        modes:                   (array)
        current:                 (dict) current mode
            ui:                  (dict) UI elements
            background:          (array)
                image:           (image)
                path:            (string)
                name:            (string)    
    */
    var context = { 
        params: params,
        gfxname: [], 
        half:1,
        nickname: params.nickname
    };
    
    InitializeUI(context, params);
    InitializeModes(context, params, context.ui);
    LoadSymbolsMap(context, params);
    ReparseNickname(context);

    // Set blinking timer
    StartScheduler(context);
    
    return context;
}

// ====================
//   Scheduler 

function StartScheduler(context)
{
    context.interval =  50;
    context.counter  =  0;
    context.opaque = [
        {
            step:0,
            duration:20,
            opaque:1.0,
            increament:0.05
        },
        {
            step:0,
            duration:20,
            opaque:1.0,
            increament:0.035
        }
    ];
    context.timer = setTimeout(function() { TimerDispatcher(context); }, context.interval);
}

function TimerDispatcher(context)
{    
    ProceedBlinking(context, context.opaque[0]);
    ProceedBlinking(context, context.opaque[1]);
    ProceedLayers(context);
    
    UpdateScene(context);
    
    context.timer = setTimeout(function() { TimerDispatcher(context); }, context.interval);
}

function ProceedLayers(context)
{
    context.counter += context.interval;
    if (context.counter < 500)
        return;
    
    context.counter = 0;
    context.half = (context.half != 1 ? 1 : 0);
}

function ProceedBlinking(context, opaque)
{
    opaque.step++;

    if (opaque.step <= opaque.duration)
    {
        opaque.opaque -= opaque.increament;
    }
    else if (opaque.step < (opaque.duration * 2))
    {
        opaque.opaque += opaque.increament;
    }
    else
    {
        opaque.step = 0;
        opaque.opaque = 1.0;
    }
}

// ====================
//   Panel view

function InitializeUI(context, params)
{
    var ui = context.ui = {};
    var root = document.getElementById(params.containerId);
    root.innerHTML = "";

    LoadUIStyles();

    CreateContainer(ui, params, root);
    CreateTopPanel(ui, params);
    CreateModePanel(ui, params);
    CreateCanvas(ui, params);
    PrepareCanvas(context, ui);
    CreateBottomPanel(ui, params);

    ui.nickname.oninput = function() { OnChangeNickname(context); };
    ui.mode.onchange = function() { OnChangeMode(context); };
    ui.background.onchange = function() { OnChangeBackground(context); };
}

function LoadUIStyles()
{
    InjectCSS("\
        .q3gfx-panel-button\
        {\
            padding:2px;\
            margin:0px 3px 0px 2px;\
            font-family:Consolas;\
            font-size:11px;\
            font-weight:bold;\
            border:1px solid #333;\
            background-color:#666;\
        }\
        .q3gfx-panel-button:hover {\
            text-shadow:1px 1px 1px black;\
        }\
        .q3gfx-panel-button:active {\
            padding:1px 1px 1px 1px;\
            margin:0px 4px 0px 3px;\
        }\
    ");

    InjectCSS("\
        .q3gfx-symbols-button\
        {\
            width:16px;\
            height:16px;\
            padding:2px;\
            margin:0px 3px -7px 2px;\
            font-family:Consolas;\
            border:1px solid #333;\
            background-color:#666;\
        }\
        .q3gfx-symbols-button:hover {\
            padding:1px;\
            width:18px;\
            height:18px;\
        }\
        .q3gfx-symbols-button:active {\
            padding:0px;\
            width:20px;\
            height:20px;\
        }\
    ");
}

function InjectCSS(css)
{
    const style = document.createElement('style');
    style.textContent = css;
    document.getElementsByTagName('head')[0].appendChild(style);
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
    container.align = "left";
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
    nickname.selectionStart = 0;
    nickname.selectionEnd = 0;
    nickname.style.width  = "350px";
    nickname.style.height = "18px";
    nickname.style.fontFamily = "Consolas";
    nickname.style.fontSize = "18px";
    nickname.style.fontWeight = "bold";
    nickname.style.backgroundColor = "#999";
    nickname.style.border = "1px solid #666";
    window.onload = function() { nickname.value = params.nickname; };
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
    var ctx2d = context.ctx2d = ui.canvas.getContext("2d");
    ctx2d.fillStyle = "rgb(100, 100, 100)";
    ctx2d.fillRect(0, 0, params.width, params.height);
}

function CreateBottomPanel(ui, params)
{
    var panel = ui.panel3 = document.createElement("div");
    panel.style.height = "22px";
    panel.style.padding  = "5px";

    var output = ui.output = document.createElement("input");
    output.type = "text";
    output.readOnly = true;
    output.style.width = "780px";
    output.style.height = "20px";
    output.style.fontFamily = "Consolas";
    output.style.fontSize = "18px";
    output.style.fontWeight = "bold";
    output.style.color = "#666";
    output.style.backgroundColor = "rgba(0, 0, 0, 0)";
    output.style.padding = "2px";
    output.style.border = "0px";
    panel.appendChild(output);

    ui.container.appendChild(panel);
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

function MakeButton(text, handler)
{
    var button = document.createElement("input");
    button.type = "button";
    button.value = text;
    button.className = "q3gfx-panel-button";
    button.onclick = handler;
    return button;
}

function MakeColoredButton(text, font, back, handler)
{
    var color = MakeButton(text, handler);
    color.style.backgroundColor = font;
    color.style.color = back;
    return color;
}

function MakeRGBButton(context, text, handler)
{
    var button = MakeButton(text, handler);
    var rgb = document.createElement("input");
    rgb.type = "color";
    rgb.value = "#000000";
    rgb.oninput = function() { handler(rgb.value.substring(1)); };

    button.appendChild(rgb);
    button.onclick = function() 
    { 
        rgb.click();
        rgb.dispatchEvent(new Event('input'));
    };

    return button;
}

function MakeSymbolsButton(context, chr)
{
    var image = new Image();
    image.className = "q3gfx-symbols-button";
    image.src = MakeResourcePath(context, "chr_" + chr + ".png");
    image.onclick = MakeSymbolHandler(context, chr);
    return image;
}

function MakeTagHandler(context, tag) 
{ 
    return function(){ AddTag(context, tag); };  
}

function MakeSymbolHandler(context, symbol) 
{ 
    return function(){ InjectTagToNickname(context, String.fromCodePoint(symbol)); };  
}

function MakePanel2Div()
{
    var div = document.createElement("div");
    div.style.padding = "0px";
    div.style.margin = "0px";
    div.style.display = 'none';
    return div;
}

function MarkNickname(context, valid)
{
    var textbox = context.ui.nickname;
    textbox.style.backgroundColor = (valid ? "#999" : "#c00");
}

// ====================
//   Controls

function OnChangeNickname(context)
{
    ReparseNickname(context);
    if (!context.current.validate(context.nickname))
        MarkNickname(context, false);
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

function IsValidVQ3Name(nickname)
{
    var valid = false;

    for (var i = 0; i < nickname.length; i++)
    {
        var code = nickname[i].charCodeAt(0);
        
        if (code == 0 || code == 10 || code == 13)
            return false;

        if (!valid && code >= 32)
            valid = true;

        if (IsBadQ3Char(code))
            return false;
    }

    return valid;
}

function IsValidCPMAName(nickname)
{
    for (var i = 0; i < nickname.length; i++)
    {
        var code = nickname[i].charCodeAt(0);
        if (code < 32 || code >= 127)
            return false;

        if (IsBadQ3Char(code))
            return false;
    }

    return IsValidVQ3Name(nickname);
}

function IsBadQ3Char(code)
{
    //TODO: add all bad chars
    if (code == "%".charCodeAt(0) || code == "\\".charCodeAt(0) || code == ";".charCodeAt(0))
        return true;
    
    return false;
}

function LoadNickname(context)
{
    var nickname = context.ui.nickname.value;
    var shrinked = context.current.shrink(nickname);
    shrinked = TransformTopCodeChars(shrinked);
    MarkNickname(context, (shrinked == nickname));
    context.ui.output.value = "\\name \"" + shrinked + "\"";
    context.nickname = shrinked;
}

function TransformTopCodeChars(nickname)
{
    var transformed = "";
    for (var i = 0; i < nickname.length; i++)
    {
        var code = nickname[i].charCodeAt(0);
        transformed += (code > 127 ? "." : nickname[i]);

    }
    return transformed;
}

// ====================
//   Modes

function InitializeModes(context, params, ui)
{
    var index = 0;
    context.modes = [];

    for (var i = 0, a = 0; i < params.modes.length; i++)
    {
        var settings = params.modes[i];
        var mode = { ui:{div:MakePanel2Div()}, background:[], index:a };

        if (settings.mode == "vq3")
        {
            mode.name = "VQ3 (default)";
            mode.parser = ParseGFX_VQ3Style;
            mode.validate = IsValidVQ3Name;
            mode.shrink = ShrinkVQ3Name;
            CreateVQ3Panel(context, mode);
        }
        else if (settings.mode == "osp")
        {
            mode.name = "OSP Mode";
            mode.parser = ParseGFX_OSPStyle;
            mode.validate = IsValidVQ3Name;
            mode.shrink = ShrinkVQ3Name;
            CreateOSPPanel(context, mode);
        }
        else if (settings.mode == "cpma")
        {
            mode.name = "CPMA Mode";
            mode.parser = ParseGFX_CPMAStyle;
            mode.validate = IsValidCPMAName;
            mode.shrink = ShrinkCPMAName;
            CreateCPMAPanel(context, mode);
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

            AsyncLoadImage(mode.background[b], MakeResourcePath(context, settings.maps[b].image), OnLoadImageForMode);
        }
        
        context.ui.mode.appendChild(MakeOption(mode.name));

        if (settings.hasOwnProperty("default") && settings.default)
        {
            index = a;
            context.current = mode;
        }

        context.modes[a++] = mode;
    }

    if (!context.hasOwnProperty("current"))
    {
        if (!context.modes.length)
            alert("Error, modules aren't configurated");
        context.current = context.modes[0];
    }

    context.ui.mode.selectedIndex = index;
    
    CreateSymbolsPanel(context, ui);
    LoadCurrentMode(context);
}

function LoadCurrentMode(context)
{
    var mode = context.current;
    var background = mode.background;

    // Display current mode bar
    mode.ui.div.style.display = 'block';
    ShowSymbolsPanel(context, false);

    // Load new background list
    context.ui.background.innerHTML = "";
    for (var i = 0; i < background.length; i++)
        context.ui.background.appendChild(MakeOption(background[i].name));

    SwitchToSelectedBackground(context);
    ReparseNickname(context);
    if (!mode.validate(context.nickname))
        MarkNickname(context, false);
}

function CreateSymbolsPanel(context, ui)
{
    var panel = ui.symbols = MakePanel2Div();

    var button = MakeButton("Back", function() { ShowSymbolsPanel(context, false); });
    panel.appendChild(button);

    panel.appendChild(MakeSymbolsButton(context, 1));
    panel.appendChild(MakeSymbolsButton(context, 2));
    panel.appendChild(MakeSymbolsButton(context, 3));
    panel.appendChild(MakeSymbolsButton(context, 4));
    panel.appendChild(MakeSymbolsButton(context, 7));
    panel.appendChild(MakeSymbolsButton(context, 8));
    panel.appendChild(MakeSymbolsButton(context, 9));
    panel.appendChild(MakeSymbolsButton(context, 11));
    panel.appendChild(MakeSymbolsButton(context, 14));
    panel.appendChild(MakeSymbolsButton(context, 16));
    panel.appendChild(MakeSymbolsButton(context, 17));
    panel.appendChild(MakeSymbolsButton(context, 18));
    panel.appendChild(MakeSymbolsButton(context, 19));
    panel.appendChild(MakeSymbolsButton(context, 20));
    panel.appendChild(MakeSymbolsButton(context, 21));
    panel.appendChild(MakeSymbolsButton(context, 23));
    panel.appendChild(MakeSymbolsButton(context, 24));
    panel.appendChild(MakeSymbolsButton(context, 25));
    panel.appendChild(MakeSymbolsButton(context, 26));
    panel.appendChild(MakeSymbolsButton(context, 27));
    panel.appendChild(MakeSymbolsButton(context, 29));
    panel.appendChild(MakeSymbolsButton(context, 30));
    panel.appendChild(MakeSymbolsButton(context, 31));
    panel.appendChild(MakeSymbolsButton(context, 127));
    
    panel.style.display = 'none';

    ui.panel2.appendChild(panel);
}

function CreateVQ3Panel(context, mode)
{
    var panel = mode.ui.div;
    
    var blink = MakeButton("Symbols", function() { ShowSymbolsPanel(context, true); });
    panel.appendChild(blink);

    panel.appendChild(MakeColoredButton("^0", "#000000", "white", MakeTagHandler(context, "^0")));
    panel.appendChild(MakeColoredButton("^1", "#ff0000", "white", MakeTagHandler(context, "^1")));
    panel.appendChild(MakeColoredButton("^2", "#00ff00", "black", MakeTagHandler(context, "^2")));
    panel.appendChild(MakeColoredButton("^3", "#ffff00", "black", MakeTagHandler(context, "^3")));
    panel.appendChild(MakeColoredButton("^4", "#0000ff", "white", MakeTagHandler(context, "^4")));
    panel.appendChild(MakeColoredButton("^5", "#00ffff", "black", MakeTagHandler(context, "^5")));
    panel.appendChild(MakeColoredButton("^6", "#ff00ff", "white", MakeTagHandler(context, "^6")));
    panel.appendChild(MakeColoredButton("^7", "#ffffff", "black", MakeTagHandler(context, "^7")));
}

function CreateOSPPanel(context, mode)
{
    var panel = mode.ui.div;

    var blink = MakeButton("Symbols", function() { ShowSymbolsPanel(context, true); });
    panel.appendChild(blink);

    panel.appendChild(MakeColoredButton("^0", "#000000", "white", MakeTagHandler(context, "^0")));
    panel.appendChild(MakeColoredButton("^1", "#ff0000", "white", MakeTagHandler(context, "^1")));
    panel.appendChild(MakeColoredButton("^2", "#00ff00", "black", MakeTagHandler(context, "^2")));
    panel.appendChild(MakeColoredButton("^3", "#ffff00", "black", MakeTagHandler(context, "^3")));
    panel.appendChild(MakeColoredButton("^4", "#0000ff", "white", MakeTagHandler(context, "^4")));
    panel.appendChild(MakeColoredButton("^5", "#00ffff", "black", MakeTagHandler(context, "^5")));
    panel.appendChild(MakeColoredButton("^6", "#ff00ff", "white", MakeTagHandler(context, "^6")));
    panel.appendChild(MakeColoredButton("^7", "#ffffff", "black", MakeTagHandler(context, "^7")));
    panel.appendChild(MakeColoredButton("^8", "#ff8800", "black", MakeTagHandler(context, "^8")));
    panel.appendChild(MakeColoredButton("^9", "#888888", "white", MakeTagHandler(context, "^9")));

    var blink = MakeButton("Fast Blink", MakeTagHandler(context, "^b"));
    panel.appendChild(blink);

    blink = MakeButton("Slow Blink", MakeTagHandler(context, "^B"));
    panel.appendChild(blink);

    var half1 = MakeButton("Layer #1", MakeTagHandler(context, "^f"));
    panel.appendChild(half1);

    var half2 = MakeButton("Layer #2", MakeTagHandler(context, "^F"));
    panel.appendChild(half2);

    var rgb = MakeRGBButton(context, "RGB Front", function(rgb) { ApplyRGBFront(context, rgb); });
    panel.appendChild(rgb);

    var rgb2 = MakeRGBButton(context, "RGB Back", function(rgb) { ApplyRGBBackground(context, rgb); });
    panel.appendChild(rgb2);

    var stop = MakeButton("Stop Effect", MakeTagHandler(context, "^N"));
    panel.appendChild(stop);
}

function CreateCPMAPanel(context, mode)
{
    var panel = mode.ui.div;
    panel.appendChild(MakeColoredButton("^0", "#000", "white", MakeTagHandler(context, "^0")));
    panel.appendChild(MakeColoredButton("^1", "#f00", "white", MakeTagHandler(context, "^1")));
    panel.appendChild(MakeColoredButton("^2", "#0f0", "black", MakeTagHandler(context, "^2")));
    panel.appendChild(MakeColoredButton("^3", "yellow", "black", MakeTagHandler(context, "^3")));
    panel.appendChild(MakeColoredButton("^4", "#00f", "white", MakeTagHandler(context, "^4")));
    panel.appendChild(MakeColoredButton("^5", "aqua", "black", MakeTagHandler(context, "^5")));
    panel.appendChild(MakeColoredButton("^6", "magenta", "white", MakeTagHandler(context, "^6")));
    panel.appendChild(MakeColoredButton("^7", "#bbb", "white", MakeTagHandler(context, "^7")));
    panel.appendChild(MakeColoredButton("^8", "#888", "black", MakeTagHandler(context, "^8")));
    panel.appendChild(MakeColoredButton("^9", "#77c", "white", MakeTagHandler(context, "^9")));
    panel.appendChild(MakeColoredButton("a", "#f00", "white", MakeTagHandler(context, "^a")));
    panel.appendChild(MakeColoredButton("b", "#f40", "white", MakeTagHandler(context, "^b")));
    panel.appendChild(MakeColoredButton("c", "#f80", "black", MakeTagHandler(context, "^c")));
    panel.appendChild(MakeColoredButton("d", "#fc0", "black", MakeTagHandler(context, "^d")));
    panel.appendChild(MakeColoredButton("e", "#ff0", "black", MakeTagHandler(context, "^e")));
    panel.appendChild(MakeColoredButton("f", "#cf0", "black", MakeTagHandler(context, "^f")));
    panel.appendChild(MakeColoredButton("g", "#8f0", "black", MakeTagHandler(context, "^g")));
    panel.appendChild(MakeColoredButton("h", "#4f0", "black", MakeTagHandler(context, "^h")));
    panel.appendChild(MakeColoredButton("i", "#0f0", "black", MakeTagHandler(context, "^i")));
    panel.appendChild(MakeColoredButton("j", "#0f4", "black", MakeTagHandler(context, "^j")));
    panel.appendChild(MakeColoredButton("k", "#0f8", "black", MakeTagHandler(context, "^k")));
    panel.appendChild(MakeColoredButton("l", "#0fc", "black", MakeTagHandler(context, "^l")));
    panel.appendChild(MakeColoredButton("m", "#0ff", "black", MakeTagHandler(context, "^m")));
    panel.appendChild(MakeColoredButton("n", "#0cf", "black", MakeTagHandler(context, "^n")));
    panel.appendChild(MakeColoredButton("o", "#08f", "white", MakeTagHandler(context, "^o")));
    panel.appendChild(MakeColoredButton("p", "#04f", "white", MakeTagHandler(context, "^p")));
    panel.appendChild(MakeColoredButton("q", "#00f", "white", MakeTagHandler(context, "^q")));
    panel.appendChild(MakeColoredButton("r", "#40f", "white", MakeTagHandler(context, "^r")));
    panel.appendChild(MakeColoredButton("s", "#80f", "black", MakeTagHandler(context, "^s")));
    panel.appendChild(MakeColoredButton("t", "#c0f", "black", MakeTagHandler(context, "^t")));
    panel.appendChild(MakeColoredButton("u", "#f0f", "white", MakeTagHandler(context, "^u")));
    panel.appendChild(MakeColoredButton("v", "#f0c", "white", MakeTagHandler(context, "^v")));
    panel.appendChild(MakeColoredButton("w", "#f08", "white", MakeTagHandler(context, "^w")));
    panel.appendChild(MakeColoredButton("x", "#f04", "white", MakeTagHandler(context, "^x")));
    panel.appendChild(MakeColoredButton("y", "#666", "white", MakeTagHandler(context, "^y")));
    panel.appendChild(MakeColoredButton("z", "#aaa", "black", MakeTagHandler(context, "^z")));
}

// ====================
//   Panel controls

function AddTag(context, tag)
{
    if (tag.length >= 1 && tag[0] != '^')
        tag = '^' + tag;
    InjectTagToNickname(context, tag);
}

function AddSelectedTag(context, tag)
{
    var nickname = context.ui.nickname;
    var pos = nickname.selectionStart;
    AddTag(context, tag);
    nickname.selectionEnd = nickname.selectionStart;
    nickname.selectionStart = pos;
    nickname.focus();
}

function ApplyRGBFront(context, rgb)
{
    var nickname = context.ui.nickname;
    var value = nickname.value;
    var pos = nickname.selectionStart;
    var end = nickname.selectionEnd;

    if (end == pos)
    {
        AddSelectedTag(context, "^x" + rgb + "^n");
        return;
    }
    
    nickname.value = value.slice(0, pos) + value.slice(end);
    nickname.selectionStart = pos;
    nickname.selectionEnd = pos;

    AddSelectedTag(context, "^x" + rgb + "^n");
}

function ApplyRGBBackground(context, rgb)
{
    var nickname = context.ui.nickname;
    var value = nickname.value;
    var pos = nickname.selectionStart;
    var end = nickname.selectionEnd;

    if (end == pos)
    {
        AddSelectedTag(context, "^x" + rgb);
        return;
    }
    
    nickname.value = value.slice(0, pos) + value.slice(end);
    nickname.selectionStart = pos;
    nickname.selectionEnd = pos;

    AddSelectedTag(context, "^x" + rgb);
}

function InjectTagToNickname(context, tag)
{
    var nickname = context.ui.nickname;
    var value = nickname.value;
    var pos = nickname.selectionStart;
    nickname.value = InjectStringToString(value, pos, tag);
    nickname.selectionStart = pos + tag.length;
    nickname.selectionEnd = nickname.selectionStart;
    nickname.focus();
    nickname.dispatchEvent(new Event('input'));
}

function InjectStringToString(src, pos, str)
{
    return src.slice(0, pos) + str + src.slice(pos);
}

function GetSelectedText(elem)
{
    return elem.value.substring(elem.selectionStart, elem.selectionEnd);
}

function ShowSymbolsPanel(context, show)
{
    var mode = context.current;
    var ui = context.ui;
    if (show)
    {
        mode.ui.div.style.display = 'none';
        ui.symbols.style.display = 'block';
    }
    else
    {
        mode.ui.div.style.display = 'block';
        ui.symbols.style.display = 'none';
    }
}

// ====================
//   GFX

function LoadSymbolsMap(context, params)
{
    context.map = []; // 0 - background, 1 - front
    for (var i = 0; i < 2; i++)
    {
        var entry = {};
        entry.canvas = document.createElement("canvas");
        entry.canvas.width = entry.canvas.height = 64 * 16;
        entry.ctx2d = entry.canvas.getContext("2d");
        entry.color = "";
        context.map[i] = entry;
    }

    AsyncLoadImage(context, MakeResourcePath(context, params.symbolsMap), function(result)
        {
            if (result.error != "success")
                return;
            
            for (var i = 0; i < 2; i++)
            {
                var entry = context.map[i];
                var ctx2d = entry.ctx2d;
                ctx2d.drawImage(result.image, 0, 0, 64 * 16, 64 * 16);
                ctx2d.fillStyle = entry.color;
                ctx2d.globalCompositeOperation = "source-in";
                ctx2d.fillRect(0, 0, 64 * 16, 64 * 16);
                ctx2d.globalCompositeOperation = "source-over";
            }

            context.symbols = result.image;
        }
    );
}

function UpdateScene(context)
{
    var ctx2d  = context.ctx2d;
    var params = context.params;
    
    // Draw background image
    if (context.hasOwnProperty("background"))
    {
        ctx2d.drawImage(context.background, 0, 0, params.width, params.height);
    }
    else
    {
        ctx2d.fillStyle = "rgb(100, 100, 100)";
        ctx2d.fillRect(0, 0, params.width, params.height);
    }

    DrawNicknameBar(context, context.gfxname[context.half]);
}

function DrawNicknameBar(context, gfx)
{
    var font = 45;
    var max = 16;

    var params = {
        x:context.params.width / 2,
        y:context.params.height / 6.0,
        size:(context.params.width - (font * 2)) / max,
        shadow:true,
        center:true
    };
    
    if (gfx.length > max)
    {
        var total = max * params.size;
        params.size = total / gfx.length;
    }

    DrawGFXText(context, gfx, params);
}

function DrawGFXText(context, gfx, params)
{
    var spacing = params.size;
    var offset = params.size / 12;

    if (!context.hasOwnProperty("symbols"))
        return;

    var x = params.x;
    if (params.center)
        x = (context.params.width - (spacing * gfx.length) ) / 2;

    for (var i = 0; i < gfx.length; i++)
    {
        var entry = gfx[i];
        
        var opaque = (entry.blink ? context.opaque[entry.blink - 1].opaque : 1.0);
        
        var code = entry.symbol.charCodeAt(0);
        var symPosX = code % 16;
        var symPosY = (code - symPosX) / 16;

        if (params.shadow)
        {
            DrawSymbolUsingMap(
                context,
                context.map[0],
                ConvertVectorToRGBA(entry.backgroundColor, opaque),
                symPosX,
                symPosY,
                x + (i * spacing) + offset,
                params.y + offset, 
                params.size,
                params.size
            );
        }
        
        DrawSymbolUsingMap(
            context,
            context.map[1],
            ConvertVectorToRGBA(entry.color, opaque),
            symPosX,
            symPosY,
            x + (i * spacing),
            params.y, 
            params.size,
            params.size
        );
    }
}

function DrawSymbolUsingMap(context, map, color, symX, symY, x, y, w, h)
{
    if (color != map.color)
    {
        var ctx2d  = map.ctx2d;
        map.color = color;
        ctx2d.drawImage(context.symbols, 0, 0, 64 * 16, 64 * 16, 0, 0, 64 * 16, 64 * 16);
        ctx2d.fillStyle = map.color;
        ctx2d.globalCompositeOperation = "source-in";
        ctx2d.fillRect(0, 0, 64 * 16, 64 * 16);
        ctx2d.globalCompositeOperation = "source-over";
    }

    var ctx2d  = context.ctx2d;
    ctx2d.drawImage(map.canvas, 64 * symX, 64 * symY, 64, 64, x, y, w, h);
}

function ReparseNickname(context)
{
    LoadNickname(context);
    context.current.parser(context, context.nickname);
}

function ShrinkVQ3Name(nickname)
{
    if (nickname.length > 35)
        nickname = nickname.substring(0, 35);

    return nickname;
}

function ShrinkCPMAName(nickname)
{
    var length = 0;
    var skip = false;
    var newname = "";

    for (var i = 0; i < nickname.length; i++)
    {
        //TODO: what about case ^^^^^
        if (nickname[i] == '^')
            skip = true;
        else if (skip)
            skip = false;
        else
            length++;
        
        newname += nickname[i];

        if (length >= 16)
            break;
    }

    return newname;
}

function ParseGFX_VQ3Style(context, nickname)
{
    // There is one name layer
    context.gfxname[0] = context.gfxname[1] = ParseGFX_VQ3(nickname);
}

function ParseGFX_OSPStyle(context, nickname)
{
    // There are two name layers
    context.gfxname[0] = ParseGFX_OSP(nickname, 0);
    context.gfxname[1] = ParseGFX_OSP(nickname, 1);
}

function ParseGFX_CPMAStyle(context, nickname)
{
    // There is one name layer
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
            blink: 0
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
    var blinking = 0; // 0 - no blink, 1 - fast, 2 - slow
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
            {
                command = false;
                continue;
            }

            switch (chr)
            {
                case 'b':
                case 'B':
                    blinking = (chr == 'b' ? 1 : 2);
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
                    blinking = 0;
                    if (colors.custom)
                    {
                        colors.front = colors.back;
                        colors.custom = false;
                    }
                case 'N':
                    blinking = 0;
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
            blink: 0
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
    chr = chr.toLowerCase();

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

// ====================
//   Misc

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

function MakeResourcePath(context, name)
{
    return context.params.resources + "\\" + name;
}
