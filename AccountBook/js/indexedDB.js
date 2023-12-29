window.addEventListener('load', () => {

	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	if (!window.indexedDB) {
		showMessage("您的瀏覽器不支援indexedDB");
	}

	var db = null;
	const dbName = "moneybook";
	const storeName = "account";
	const version = 1;


	let today = new Date();
	let dd = String(today.getDate()).padStart(2, '0');
	let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	let yyyy = today.getFullYear();

	today = yyyy + "-" + mm + "-" + dd;
	document.getElementById("inputDate").value = today;


	//開啟資料庫	
	(function init() {
		var req = indexedDB.open(dbName, version);

		req.onsuccess = (e) => {
			db = e.target.result;
			getAllList("", "");
		};

		req.onerror = (e) => {
			showMessage("openDB error");
		};

		req.onupgradeneeded = (e) => {
			let thisDB = e.target.result;
			if (!thisDB.objectStoreNames.contains(storeName)) {
				//全部欄位： id,addKind,date,money,memo,timestamp
				var objectStore = thisDB.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
				objectStore.createIndex("addKind", "addKind", { unique: false });
				objectStore.createIndex("date", "date", { unique: false });
				objectStore.createIndex("memo", "memo", { unique: false });
			}
		};

		let ul = document.getElementById("selectMonth");
		for (var i = 1; i <= 12; i++) {
			ul.innerHTML += "<li><a class='dropdown-item' href='#' data-key=" + i + ">" + i + "月</a></li>";
		}
		ul.innerHTML += "<li><a class='dropdown-item' href='#' data-key='0'>全部</a></li>";


	})();

	//開啟交易
	function DB_tx(storeName, mode) {
		let tx = db.transaction(storeName, mode);
		tx.onerror = (e) => {
			console.error("tx", e);
		};
		return tx;
	}

	//新增資料
	document.getElementById('savebtn').addEventListener('click', (e) => {
		e.preventDefault();
		let tx = DB_tx(storeName, 'readwrite');   //交易權限是可讀寫
		tx.oncomplete = (e) => {     //交易完成時觸發
			getAllList("", "");   //重整列表資料
		};
		let store = tx.objectStore(storeName);

		//取得文字方塊輸入內容
		let addKind = document.getElementById("addKind").value.trim();
		let date = document.getElementById("inputDate").value.trim();
		let money = document.getElementById("inputMoney").value.trim();
		let memo = document.getElementById("inputMemo").value.trim();

		value = {
			addKind,
			date,
			money,
			memo,
			timestamp: new Date()
		};
		r = store.add(value);	     //新增資料  

	})

	//刪除資料
	document.getElementById('cards').addEventListener('click', (e) => {
		e.preventDefault();
		let target = e.target;	//點擊的目標物件				
		let keyNo = parseInt(target.dataset.key);
		console.log("del", keyNo, target);
		//當目標物件是按鈕時才做處理
		if (target.tagName.toLowerCase() === 'a') {
			if (confirm("確定要執行刪除?")) {
				let tx = DB_tx(storeName, 'readwrite');
				let store = tx.objectStore(storeName);
				let oneRecords = store.delete(keyNo);
				oneRecords.onsuccess = (e) => {
					getAllList("", "");
				}
				oneRecords.onerror = (e) => {
					showMessage("刪除失敗!<br>" + e.target.error.message);
				}
			}
		}
	})


	//點選月份選單時觸發
	document.getElementById('selectMonth').addEventListener('click', (e) => {
		e.preventDefault();
		let target = e.target;	//點擊的目標物件	
		let month = target.dataset.key;
		/*讓month值固定為2位數，如果1位數則左側補0
		語法：str.padStart(targetLength, padString)
		e.g. month=7，month.padStart(2, '0') => '07'*/
		getCursorValue(month.padStart(2, '0'));
	})

	//點選btn-group時觸發
	document.getElementById('btnGroup').addEventListener('click', (e) => {
		e.preventDefault();
		let target = e.target;	//點擊的目標物件
		if (target.tagName.toLowerCase() === 'span') {
			console.log("btnGroup:", target.id);
		}
	})

	//點選badge時觸發
	document.getElementById('badge').addEventListener('click', (e) => {
		e.preventDefault();
		let target = e.target;	//點擊的目標物件
		if (target.tagName.toLowerCase() === 'span') {
			console.log("badge:", target.innerHTML);
			document.getElementById("inputMemo").value = target.innerHTML;
		}
	})

	//千位符
	function showThousands(num) {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	//取出每一筆資料進行比對-openCursor()
	function getCursorValue(findvalue) {
		let tx = DB_tx(storeName, 'readonly');
		let store = tx.objectStore(storeName);

		const index = store.index("date");  //依date欄位搜尋	
		let request = index.openCursor();   //啟用指標，返回IDBRequest物件
		let cursorJson = [];                //儲存符合搜尋的資料
		let cursorJsonAll = [];             //儲存全部的資料
		request.onsuccess = (e) => {
			let cursor = e.target.result;     //回傳IDBCursorWithValue
			if (cursor) {
				//比對cursor.value.date是否含有「-月份-」的資料,例如「-07-」
				if (cursor.value.date.indexOf("-" + findvalue + "-") !== -1) {
					cursorJson.push(cursor.value);   //儲存符合搜尋的資料
				}
				cursorJsonAll.push(cursor.value);  //將資料逐一儲存
				cursor.continue();                 //將指標移到下一筆
			}
			//資料列表
			if (findvalue != '00') {
				showDataList(cursorJson);     //選擇月份
			} else {
				showDataList(cursorJsonAll);  //選擇全部
			}
		};
	}

	//取出全部資料
	function getAllList(find, findvalue) {

		let tx = DB_tx(storeName, 'readonly');
		let store = tx.objectStore(storeName);
		let allRecords = null;

		//判斷是搜尋或是完整資料列表
		if (find != "") {
			let index = store.index(find);    //依索引欄位搜尋
			allRecords = index.getAll(findvalue);   //取出搜尋到的全部資料
		} else {
			allRecords = store.getAll();    //取出全部資料		
		}
		allRecords.onsuccess = (e) => {
			let request = e.target.result;
			showDataList(request);
		};
		allRecords.onerror = (e) => {
			console.error("allRecords", e);
		};
	}

	//資料列表
	function showDataList(request) {

		let ulist = document.getElementById("card-item");
		ulist.innerHTML = "載入中...";
		let pay_total = 0, expenses_total = 0, income_total = 0;

		//使用map和join方法合併字串
		let contents = request.map((obj) => {
			let addKind = null, money = 0, bgColor = "";
			if (obj.addKind == "pay") {
				addKind = "支出";
				bgColor = "#8ACDD7";
				money = (0 - Number(obj.money));
				pay_total += money;
			} else if (obj.addKind == "expenses") {
				addKind = "雜項支出";
				bgColor = "#C7DCA7";
				money = (0 - Number(obj.money));
				expenses_total += money;
			} else {
				addKind = "收入";
				bgColor = "#FFC5C5";
				money = Number(obj.money);
				income_total += money;
			}
			total = pay_total + expenses_total + income_total;
			document.getElementById("incomeSpan").innerHTML = showThousands(income_total);
			document.getElementById("paySpan").innerHTML = showThousands(Math.abs(pay_total));
			document.getElementById("expensesSpan").innerHTML = showThousands(Math.abs(expenses_total));
			document.getElementById("totalSpan").innerHTML = showThousands(pay_total + expenses_total + income_total);


			return "<div class='card m-3'>" +
				"<div class='card-header d-flex justify-content-between' style='background-color:" + bgColor + "'>" +
				"<h6 class='mt-2'>" + obj.date + "</h6><h6>" + addKind +
				"&nbsp;<a href='#' class='delbtn' data-key='" + obj.id +
				"'>×</a>" +
				"</h6>" +
				"</div>" +
				"<div class='card-body d-flex'>" +
				"<span class='m-2'>" +
				"<svg class='" + obj.addKind + "' width='25' height='25' fill='" + bgColor + "'><use xlink:href='#" + obj.addKind + "'/></svg>" +
				"</span>" +
				"<p class='card-text m-2'>" + obj.memo + "</p>" +
				"<p class='ms-auto m-2'>" + showThousands(money) + "</p>" +
				"</div>" +
				"</div>"

		}).join('');

		if (contents != "") {
			ulist.innerHTML = contents;
		} else {
			ulist.innerHTML = "<p class='m-3'>沒有交易</p>";
			document.getElementById("incomeSpan").innerHTML = "0";
			document.getElementById("paySpan").innerHTML = "0";
			document.getElementById("totalSpan").innerHTML = "0";
		}
		showBadgeList(request);
	}

	function showBadgeList(request) {
		let badge = document.getElementById("badge");
		console.log(request);

		const result = Object.groupBy(request, ({ addKind }) => addKind);
		console.log(result);
	
		let badgeArr = [];

		let contents = request.map((obj) => {
			let bgColor = "";
			if (obj.addKind == "pay") {
				bgColor = "#8ACDD7";
			} else if (obj.addKind == "expenses") {
				bgColor = "#C7DCA7";
			} else {
				bgColor = "#FFC5C5";
			}
			if (badgeArr.indexOf(obj.memo) === -1 ){
				badgeArr.push(obj.memo);
				return "<span class='badge' style='background-color:" + bgColor + "'>" + obj.memo + "</span>"
			} else {
				return ""
			}

		}).join('');

		if (contents != "") {
			badge.innerHTML = contents;
		}
	}

});