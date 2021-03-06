var dataView = document.getElementById('dataview');
var messageView = document.getElementById('messageview');

var contentTable = document.getElementById('content');
var checkboxes = document.getElementsByClassName('checkbox');
var ths = document.getElementsByTagName('th');
for (var i = 0; i < ths.length; i ++) {
	ths[i].addEventListener('click', saveSorting);
}

function renderData() {
	// hide table to prevent flashing on loading
	dataView.style.display = 'none';
	messageView.style.display = 'none';
	chrome.storage.local.get(null, function(items){
		if (items.count) {
			document.getElementById('number').textContent = items.count;
			document.getElementById('timestamp').textContent = items.timestamp;
			for (var i = 0; i < items.count; i++) {
				var item = items.entitlements[i];
				var row = contentTable.insertRow(-1);
				var noCell = row.insertCell(-1);
				noCell.setAttribute('class', 'no');
				noCell.innerHTML = i;
				var nameCell = row.insertCell(-1);
				nameCell.innerHTML = item.name;
				var platformCell = row.insertCell(-1);
				platformCell.innerHTML = item.platform;
				platformCell.setAttribute('class', 'platform');
				var typeCell = row.insertCell(-1);
				typeCell.innerHTML = item.type;
				var sizeCell = row.insertCell(-1);
				sizeCell.innerHTML = formatSize(item.size);
				sizeCell.setAttribute('sorttable_customkey', item.size);
				var dateCell = row.insertCell(-1);
				dateCell.innerHTML = item.date;
				var idCell = row.insertCell(-1);
				idCell.innerHTML = linkfy(item.id);
				idCell.setAttribute('class', 'monospace');
				row.setAttribute('class', 'type--' + item.platform.toLowerCase());
				row.setAttribute('data-type', 'type--' + item.type.toLowerCase());
			}
			sorttable.makeSortable(contentTable);

			var jets = new Jets({
				searchTag: '#inputSearch',
				contentTag: '#content > tbody',
				columns: [1]
			});

			// re-apply platform filter
			for (var i = 0; i < checkboxes.length; i++) {
				if (items.toggles) {
					checkboxes[i].checked = items.toggles[i];
				}
				checkboxes[i].addEventListener('change', filterPlatforms);
			}

			// re-apply table sorting
			if (items.sortBy) {
				var tableHead = document.getElementById(items.sortBy);
				sorttable.innerSortFunction.apply(tableHead);
				if (items.reverseOrder) sorttable.innerSortFunction.apply(tableHead);
			}

			filterPlatforms();
		}
		// No items in cache, show guiding message
		else {
			messageView.style.display = '';
		}
	});
}

function filterPlatforms() {
	var checkboxVals = [];
	for (var i = 0; i < checkboxes.length; i++) {
		checkboxVals.push(checkboxes[i].checked);
	}
	chrome.storage.local.set({'toggles': checkboxVals});
	toggleRows();
}

function toggleRows() {
	chrome.storage.local.get('toggles', function(platform) {
		var platformClasses = ['type--license', 'type--ps4', 'type--ps3', 'type--psvita', 'type--psp', 'type--game', 'type--dlc', 'type--extra'];
		var rows = document.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
		for (var i = 0; i < rows.length; i++) {
			var toggle = platform.toggles[platformClasses.indexOf(rows[i].className)] && platform.toggles[platformClasses.indexOf(rows[i].getAttribute('data-type'))];
			rows[i].style.display = toggle ? '' : 'none';
		}
		// show table after sortig (prevent flashing on loading)
		dataView.style.display = '';
	});
}

function saveSorting() {
	chrome.storage.local.set({'sortBy': this.id, 'reverseOrder': this.classList.contains('sorttable_sorted')});
}

function formatSize(bytes) {
	if (typeof bytes !== 'number') return bytes;
	if (bytes > 1073741824) return (bytes/1073741824).toFixed(2) + ' GB';
	if (bytes > 1048576) return (bytes/1048576).toFixed(2) + ' MB';
	if (bytes > 1024) return (bytes/1024).toFixed(2) + ' kB';
	return bytes + ' B';
}

function linkfy(id) {
	return '<a href="https://store.playstation.com/#!/cid=' + id + '">' + id + '</a>';
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if (namespace === 'local' && changes['count']) {
		location.reload();
	}
});

renderData();
