const formElement = document.getElementById("form");

const formResponce = {};

formElement.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.classList.add("submitted");
    submitBtn.textContent = "Request is sent";

    const formData = new FormData(formElement);

    formResponce.firstName = formData.get("firstname");
    formResponce.lastName = formData.get("lastname");
    formResponce.phone = formData.get("phone");
    formResponce.email = formData.get("email") ? formData.get("email") : "";
    formResponce.jobType = formData.get("job-type");
    formResponce.jobSource = formData.get("job-source");
    formResponce.jobDescription = formData.get("job-description")
        ? formData.get("job-description")
        : "";
    formResponce.address = formData.get("address");
    formResponce.city = formData.get("city");
    formResponce.state = formData.get("state");
    formResponce.zipeCode = formData.get("zip-code");
    formResponce.area = formData.get("area");
    formResponce.date = formData.get("date");
    formResponce.startTime = formData.get("start-time");
    formResponce.endTime = formData.get("end-time");
    formResponce.responsiblePerson = formData.get("responsible");

    console.log(formResponce);

    async function sendData(data) {
        await fetch("/form-handler", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.message === "ok") {
                    document.body.textContent = "";
                    document.body.setAttribute("align", "center");
                    const title = document.createElement("h2");
                    title.textContent = "Job is created!";
                    const link = document.createElement("a");
                    link.textContent = "View deal";
                    link.setAttribute(
                        "href",
                        "https://none-sandbox6.pipedrive.com/deal/4"
                    );
                    document.body.appendChild(title);
                    document.body.appendChild(link);
                    console.log(document.body.textContent);
                }
            })
            .catch((err) => console.log(err.message));
    }

    sendData(formResponce);
    console.log("data sent to server");
});
