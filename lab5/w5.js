function showTab(platform) {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    contents.forEach(content => content.classList.remove("active"));

    document.querySelector(`button[onclick="showTab('${platform}')"]`).classList.add("active");
    document.getElementById(platform).classList.add("active");
}
