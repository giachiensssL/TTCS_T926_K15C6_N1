const userSelect = document.getElementById("userSelect");
const currentRoles = document.getElementById("currentRoles");
const roleSelect = document.getElementById("roleSelect");
const removeRoleSelect = document.getElementById("removeRoleSelect");

const assignBtn = document.getElementById("assignBtn");
const removeBtn = document.getElementById("removeBtn");

const message = document.getElementById("message");

// ID admin demo hiện tại
const currentAdminId =
    "3c4e28b3-8acf-4662-9da7-87ef223e6273";


// Load danh sách user
async function loadUsers() {
    try {
        const response = await fetch("/api/users");

        const users = await response.json();

        userSelect.innerHTML =
            '<option value="">-- Chọn người dùng --</option>';

        users.forEach(user => {
            const option = document.createElement("option");

            option.value = user.id;
            option.textContent = user.email;

            userSelect.appendChild(option);
        });
    }
    catch (error) {
        showMessage("Không thể tải danh sách người dùng.", false);
    }
}


// Load role của user
async function loadRoles() {

    const userId = userSelect.value;

    if (!userId) {
        currentRoles.innerHTML = "Chưa chọn người dùng";
        removeRoleSelect.innerHTML = "";
        return;
    }

    try {
        const response =
            await fetch(`/api/users/${userId}/roles`);

        const data = await response.json();

        currentRoles.innerHTML = "";

        removeRoleSelect.innerHTML = "";

        if (data.roles.length === 0) {
            currentRoles.innerHTML =
                "Người dùng chưa có vai trò.";
        }

        data.roles.forEach(role => {

            const roleElement =
                document.createElement("span");

            roleElement.className = "role";
            roleElement.textContent = role;

            currentRoles.appendChild(roleElement);

            const option =
                document.createElement("option");

            option.value = role;
            option.textContent = role;

            removeRoleSelect.appendChild(option);
        });

    }
    catch (error) {
        showMessage("Không thể tải vai trò.", false);
    }
}


// Gán role
async function assignRole() {

    const userId = userSelect.value;
    const roleName = roleSelect.value;

    if (!userId) {
        showMessage(
            "Vui lòng chọn người dùng.",
            false
        );
        return;
    }

    try {

        const response = await fetch(
            `/api/users/${userId}/roles`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    roleName: roleName
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            showMessage(
                typeof data === "string"
                    ? data
                    : "Không thể gán vai trò.",
                false
            );

            return;
        }

        showMessage(
            "Gán vai trò thành công.",
            true
        );

        await loadRoles();

    }
    catch (error) {
        showMessage(
            "Có lỗi xảy ra khi gán vai trò.",
            false
        );
    }
}


// Thu hồi role
async function removeRole() {

    const userId = userSelect.value;
    const roleName = removeRoleSelect.value;

    if (!userId || !roleName) {
        showMessage(
            "Vui lòng chọn người dùng và vai trò.",
            false
        );
        return;
    }

    try {

        const response = await fetch(
            `/api/users/${userId}/roles/${roleName}?currentUserId=${currentAdminId}`,
            {
                method: "DELETE"
            }
        );

        const text = await response.text();

        if (!response.ok) {
            showMessage(text, false);
            return;
        }

        showMessage(
            "Thu hồi vai trò thành công.",
            true
        );

        await loadRoles();

    }
    catch (error) {
        showMessage(
            "Có lỗi xảy ra khi thu hồi vai trò.",
            false
        );
    }
}


function showMessage(text, success) {

    message.textContent = text;

    message.className =
        success ? "success" : "error";
}


userSelect.addEventListener(
    "change",
    loadRoles
);

assignBtn.addEventListener(
    "click",
    assignRole
);

removeBtn.addEventListener(
    "click",
    removeRole
);

loadUsers();