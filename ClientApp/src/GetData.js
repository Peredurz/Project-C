/**
 * Retrieves the value of a cookie by its name.
 * @param {string} cname - The name of the cookie.
 * @returns {string} - The value of the cookie, or an empty string if the cookie is not found.
 */
export async function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie =  decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            var json = (atob(c.substring(name.length, c.length)));
            var email = json.replace(/['"]+/g, '');
            return email;
        }
    }
    return "";
}
export async function getEmployeeId(email) {
    const response = await fetch(`/api/allemps?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    const employee = data.find(emp => emp.email.toLowerCase() === email.toLowerCase());
    if (employee) {
        return employee.id;
    } else {
        console.error('Employee not found');
        return null;
    }
}
//Populates AmountOfTimesAttending
export const GetUserInbetween = async () =>{
    try {
        const response =  await fetch('api/allemps');

        if (!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data =  await response.json();
        const userIds = data.map(user => user.id);
        try {
            await Promise.all(userIds.map(async ID => {
                try {
                    const attendanceResponse = await fetch('/api/userattendance', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: ID }),
                    });

                    const attendanceData = await attendanceResponse.json();
                } catch (error) {
                    console.error(`Error processing attendance for user ${ID}:`, error);
                    // Handle the error as needed
                }
            }));
        } catch (error) {
            console.error('Error in Promise.all:', error);
            // Handle the error as needed
        }


    } catch (error) {
        console.error('Error:', error);
    }
}