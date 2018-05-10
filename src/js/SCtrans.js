SCtrans = {
	index: 0,
	isInit: false,
	saved: false,

	got_cache: [],

	elem_input: null,
	elem_orig: null
}

SCtrans.init = function()
{
	this.index = 0;
	this.got_cache = [];
	this.saved = false;
	this.elem_input = $("#input_translate").get(0);
	this.elem_orig  = $("#input_orig").get(0);

	// Clear display
	$("#input_translate").val("");
	$("#got_romaji, #got_trad, #chara").text("")

	if ( !this.isInit )
	{
		$(this.elem_input)
		.on("input", function(e) { SCtrans.handleTextInput(e) });
		$(window).on("keydown", function(e) { SCtrans.handlekb(e); });

		$(".translation").removeClass("hide");
		$(".help-text").hide();
	}

	this.isInit = true;
}

SCtrans.handleTextInput = function(e)
{
	if ( !this.isInit ) { return; }

	var index = this.index;
	window.tl_data.messages[index].tl = this.elem_input.value;
}

SCtrans.handlekb = function(e)
{
	// RePag
	if ( e.which == 33 ) { e.preventDefault(); return this.prev(); }

	// AvPag
	else if ( e.which == 34 ) { e.preventDefault(); return this.next(); }

	// Enter
	else if ( e.which == 13 ) { e.preventDefault(); return this.next(); }

	// Ctrl + O
	else if ( e.ctrlKey == true && e.which == 79 ) { e.preventDefault(); return this.copyOriginal() }

	// Alt + R
	else if ( e.altKey == true && e.which == 82 ) { e.preventDefault(); return this.getGoT({romaji: true}); }

	// Alt + T
	else if ( e.altKey == true && e.which == 84 ) { e.preventDefault(); return this.getGoT({trad: true}); }

	// Ctrl + S
	else if ( e.ctrlKey == true && e.which == 83 ) { e.preventDefault(); return this.save_file(); }
}

SCtrans.save_file = function()
{
	if ( !this.isInit ) { return; }

	var file = new Blob([JSON.stringify(window.tl_data, null, '\t')], {type: "application/json;charset=UTF-8"});
	var url = URL.createObjectURL(file);

	// Create link to the URL resource and set it so it can be opened in a new window and downloaded
	var link = document.createElement("a");

	var filename = "translated_dialogs.json";
	if ( window.open_filename )
	{
		// So we can pass .txt or null to .json...
		var noext = window.open_filename.split(".")[0];
		filename = noext + ".json";
	}

	link.href = url;
	link.download = filename;
	link.target = "_blank";
	link.click();

	URL.revokeObjectURL(url);
	delete file;
}

SCtrans.load = function(index)
{
	if ( !this.isInit ) { return; }
	
	if ( typeof window.tl_data.messages[index] !== 'undefined' )
	{
		this.index = index;
		this.elem_orig.innerText = window.tl_data.messages[index].jp;

		$("#input_translate").val("");
		$("#got_romaji, #got_trad").text("");

		if ( window.tl_data.messages[index].tl )
		{
			this.elem_input.value = window.tl_data.messages[index].tl;
		}

		if ( window.tl_data.messages[index].ch )
		{
			$("#chara").text("[" + window.tl_data.messages[index].ch + "] ");
		}

		this.updateCount();
	}
	else { console.error("Undefined index (why?)"); }
}

SCtrans.next = function()
{
	var length = window.tl_data.messages.length - 1;

	if ( this.index < length )
	{
		this.index += 1;
		this.load(this.index);
	}
}

SCtrans.prev = function()
{
	var length = window.tl_data.messages.length - 1;

	if ( this.index > 0 )
	{
		this.index -= 1;
		this.load(this.index);
	}
}

SCtrans.updateCount = function()
{
	var index = this.index + 1,
		total = window.tl_data.messages.length;

	document.getElementById("count").innerText = index + "/" +total;
}

SCtrans.copyOriginal = function()
{
	var index = this.index;
	clipboard.set(window.tl_data.messages[index].jp);
}

SCtrans.getGoT = function(opt = null)
{
	if ( !this.isInit ) { return; }

	var index = this.index;
	var romaji_cont = document.getElementById("got_romaji");
	var trad_cont   = document.getElementById("got_trad");

	function updateTooltips()
	{
		if ( opt.romaji ) { romaji_cont.innerText = SCtrans.got_cache[index].romaji; }
		if ( opt.trad )   { trad_cont.innerText   = SCtrans.got_cache[index].sugg; }
	}

	// If there's already cache for this index, only update the tooltips.
	if ( typeof SCtrans.got_cache[index] !== "undefined" ) { updateTooltips(); return; }

	translate(window.tl_data.messages[index].jp, {to: 'en', raw: true}).then(res => {
		//console.log(res); // [!DEBUG]
		
		// Parse the raw object file
		raw_data = JSON.parse(res.raw);

		// Get the length for the index 0
		var len = raw_data[0].length;

		// Create cache for the current index
		SCtrans.got_cache[index] = {
			romaji: raw_data[0][len-1][3],
			sugg:   res.text
		}

		// Update tooltips
		updateTooltips();
	}).catch(err => {console.error(err)});
}