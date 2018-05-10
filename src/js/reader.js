// [!TODO]
//    + Modularize file operations (including save).
//    + Change all to work with the Node filesystem library.

$(function() {
	function loadFromFilePath(filepath)
	{
		try 
		{
			var json_content = fs.readFileSync(filepath, "UTF-8");
			window.tl_data = JSON.parse(json_content);

			SCtrans.init();
			SCtrans.load(0);
		}
		catch(err)
		{
			console.error(err);
			alert("There was an error with that file.");
		}
	}

	function updateTitle(filename)
	{
		document.title = filename + " - " + base_title;
		window.open_filename = filename;
	}
	
	$("input#file-select").change(function()
	{
		//console.log(this.value);
		var filepath = this.value;
		var filename = this.files[0].name;
		this.value = "";

		loadFromFilePath(filepath);
		updateTitle(filename);
	});

	const holder = document.getElementById('drop-click-area');

	window.ondragover = function () { return false; };
	window.ondragleave = function () { return false; };
	window.ondrop = function (e) {
		e.preventDefault();

		if ( e.dataTransfer.files.length )
		{
			var filename = e.dataTransfer.files[0].name;
			var ext = filename.split(".").pop().toLowerCase();
			if ( ext == "json" || ext == "txt" )
			{
				loadFromFilePath(e.dataTransfer.files[0].path);
				updateTitle(filename);
			}
		}

		return false;
	};
});