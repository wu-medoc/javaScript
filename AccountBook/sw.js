// ��ťinstall�ƥ�
self.addEventListener("install", (e) => {
    console.log("install.");
	self.skipWaiting();
});
// ��ťactivate�ƥ�
self.addEventListener("activate", (e) => {
    console.log("activate.");
});
// ��ťfetch�ƥ�
self.addEventListener('fetch', (e) => {
	console.log("fetch");
});