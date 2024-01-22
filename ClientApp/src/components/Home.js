import React, {Component, useEffect} from 'react';
import { createRoot } from 'react-dom/client';
import PeopleImg from "./Images/people-icon-sign-symbol-design-free-png.png"
import Logo from "./Images/smallLogoNoBG.png"
import {Events} from './Events';
import {AttendingEvents} from "./Events";
import {getCookie} from "../GetData";
import './Styling/Home.css';

export class Home extends Component {
  static displayName = Home.name;
    constructor(props) {
        super(props);
        this.state = {
            buttonStates : {},
            Attendancebtn: null,
            EvButton:true,
            JEvButton:false,
            ArrOffButton:true,
            UpButton:true,
            UevButton:true,
            AevButton:true,
            amount: null, 
            loading: true,
            date: null,
            day: null,
            sharedState: false,
            
        };
        this.handleClick=this.handleClick.bind(this)
    }
    /**
     * Lifecycle method called after the component has been mounted.
     * It checks if the user is in the office, fetches people data, and sets the date to today's date.
     * @returns {Promise<void>}
     */
    async componentDidMount(homeComponent, date) {
        await this.inOffice();
        await People(this, date);
        // set date to today's date
        this.state.date = new Date();
        await this.setDate(this.state.date);
        await this.AvailableSpaces(this);
        await PeopleOnsite(this, this.state.date);
    }

    /**
     * Saves the state value to the local storage.
     * @param {any} value - The value to be saved.
     */
    saveState(value){
        const checkValue = { check: value};
        localStorage.setItem('check', JSON.stringify(checkValue));
    }
    
    /**
     * Handles the click event and performs the specified action.
     * @param {Event} event - The click event.
     * @param {string} action - The action to be performed.
     * @param {string} idClass - The ID of the class.
     * @param {string} Arrow - The arrow.
     * @param {string} CorButton - The button color.
     * @param {boolean} dynamicFunction - Indicates whether a dynamic function should be executed.
     * @returns {Promise<void>}
     */
    handleClick = async (event, action, idClass, Arrow, CorButton, dynamicFunction) => {
        event.preventDefault();
        switch (action) {
            case 'Arrow': {
                this.setState((prevstate) => ({
                    [CorButton]: !prevstate[CorButton],
                    [action]: !prevstate[action]
                }));
                if (dynamicFunction) {
                    await PeopleOnsite(this, this.state.date);
                    await this.setDate(this.state.date);
                    await People(this, this.state.date);
                    await this.inOffice(this.state.date);
                    await this.AvailableSpaces(this);
                }
                var x = document.getElementById(idClass);
                switch(x){
                    case null:
                        break;
                    case x.style.display === "none":
                        x.style.display = "flex";
                        break;
                    default:
                        x.style.display = "none";
                        break;
                }
                break;
            }
            case 'btn': {
                this.setState((prevstate) => ({
                    [idClass]: !prevstate[idClass]
                }), async () => {
                    const btn = document.getElementById(idClass);
                    const initialText = 'Join';
                    if (btn.textContent.toLowerCase().includes(initialText.toLowerCase())) {
                        await JoinDay(this, this.state.date);
                        const today = new Date();
                        const statedate = this.state.date;
                        if (statedate.getDate() === today.getDate()) {
                            // set the cookie
                            const date = new Date();
                            date.setHours(23, 59, 59, 0);
                            document.cookie = "joined=true; expires=" + date + "; path=/";
                            this.setState({ Attendancebtn: true });
                            btn.textContent = 'Leave';
                            btn.className = "buttonFalse";
                        } else {
                            this.setState({ Attendancebtn: false });
                            btn.textContent = initialText;
                            btn.className = "buttonFalse";
                        }
                    } else {
                        await JoinDay(this, this.state.date);
                        var CurrentDay = new Date();
                        // delete the cookie
                        if (this.state.date.getDate() === CurrentDay.getDate()) {
                            this.setState({ Attendancebtn: true });
                            document.cookie = "joined=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            btn.textContent = initialText;
                            btn.className = "buttonTrue";
                        } else {
                            this.setState({ Attendancebtn: true });
                            btn.textContent = 'Leave';
                            btn.className = "buttonTrue";
                        }
                    }
                    await PeopleOnsite(this, this.state.date);
                    await this.inOffice(this.state.date);
                    await People(this, this.state.date);
                });
                break;
            }
            case 'PfpButton': {
                const file = document.getElementById('pfp').files[0];
                await addPFP(file);
                break;
            }
            case 'ReserveButton': {
                const email = await getCookie("user");
                const response = await fetch('/api/claimspace', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "Email": email, "RoomNumber": event.target.parentElement.children[0].textContent })
                });
                const json = await response.json();
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                else {
                    await this.AvailableSpaces(this);
                    break;
                }
            }
            case 'CancelReservationButton': {
                const email = await getCookie("user");
                const response = await fetch('/api/releasespace', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "Email": email, "RoomNumber": event.target.parentElement.children[0].textContent })
                });
                const json = await response.json();
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                else {
                    await this.AvailableSpaces(this);
                    break;
                }
            }
        }
    }
    
    /**
     * Sets the date and updates the hidden box with the adjusted date.
     * @param {string} date - The date to be set.
     * @returns {Promise<void>}
     */
    setDate = async (date) => {
        // Create a local variable for the date
        const currentDate = new Date(date);
        // Update the date in the hidden box
        this.state.day = currentDate.toDateString();

    };
    
    async AvailableSpaces(homeComponent) {
        try {
            const availableSpacesDiv = document.getElementById('availablespaces');
            if (!availableSpacesDiv) {
                console.error('Element with ID "availablespaces" not found.');
                return;
            }
            const newroot = homeComponent.newroot || createRoot(availableSpacesDiv);
    
            const user = await getCookie("user");
            const response = await fetch('api/getavailablespaces');
            const data = await response.json();
            
            if (!data.success || !data.rooms) {
                console.error('Invalid API response:', data);
                return;
            }
            data.rooms.sort((a, b) => a.roomNumber - b.roomNumber);
            const availableSpaces = data.rooms.map((space, index) => {
                const isUserReserved = space.employee && space.employee.email === user;
                const isAvailable = space.isAvailable && !space.employee;
            
                return (
                    <div key={space.roomNumber} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', textAlign: 'center', marginBottom: '10px'}}>
                        {index === 0 && ( 
                            <div style={{ display: 'flex', marginBottom: '5px', width: '100%' }}>
                                <p style={{ flex: 1, fontWeight: 'bold', marginBottom: '0', marginRight: '0' }}>Room Number</p>
                                <p style={{ flex: 1, fontWeight: 'bold', marginBottom: '0' }}>Room Name</p>
                                <p style={{ flex: 1, fontWeight: 'bold', marginBottom: '0' }}>Action</p>
                            </div>
                        )}
            
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <p style={{ flex: 1, marginTop: 0, marginBottom: 0 }}>{`${space.roomNumber}`}</p>
                            <p style={{ flex: 1, marginTop: 0, marginBottom: 0, whiteSpace: 'nowrap' }}>{`${space.roomName}`}</p>
            
                            {isUserReserved && (
                                <button type='submit' className="cancelButton" onClick={(e) => this.handleClick(e, "CancelReservationButton")}>
                                    Cancel
                                </button>
                            )}
                            {isAvailable && (
                                <button type='submit' className="reserveButton" onClick={(e) => this.handleClick(e, "ReserveButton")}>
                                    Reserve
                                </button>
                            )}
                            {!isAvailable && !isUserReserved && (
                                <button type='submit' id="reservedButton" disabled className="reserveButton">
                                    Reserved
                                </button>
                            )}
                        </div>
                    </div>
                );
            });
            await newroot.render(availableSpaces);
        } catch (error) {
            console.error('Error during AvailableSpaces:', error);
            homeComponent.setState({ loading: false });
        }
    }

    ValueChange = (newValue) => {
        // Logic to set the state in Function A
        this.setState({sharedState: newValue});
    };
    ValueButtonChange = (newValue) => {
        this.setState({buttonStates: newValue});
    };
    render() {
        return (
            <div className="main-div">
                <div className="text">
                    <h1>Home, Select</h1>
                    <hr className="hr-main"></hr>
                </div>
                <div className="inner-div">
                    <h5>Office info</h5>
                    <div className="hidden-div-off" style={{ overflowX: 'hidden' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <p className='p-home'>people coming to the office</p>
                            <div className="hidden-box" id="empsonsite" style={{ overflowY: 'auto', maxHeight: '278.517px', scrollbarWidth: 'thin', scrollbarGutter: 'auto'}}>
                            </div>
                        </div>
                        <div className="hidden-box-center">
                            <button className="arrow-button-box" onClick={(e) => { 
                                this.state.date.setDate(this.state.date.getDate() - 1);
                                this.handleClick(e, 'Arrow', 'hidden-div-On', 'ArrowOn', 'ArrOnButton', PeopleOnsite);
                            }} style={{float: 'left', borderStyle: 'none', background: 'none'}}>
                                <i className="arrow left"></i>
                            </button>
                            <div id='date' className='date-box'>{this.state.day}</div>
                            <button className="arrow-button-box" onClick={(e) => {
                                this.state.date.setDate(this.state.date.getDate() + 1);
                                this.handleClick(e, 'Arrow', 'hidden-div-On', 'ArrowOn', 'ArrOnButton', PeopleOnsite );
                            }} style={{float: 'right', borderStyle: 'none', background: 'none'}}>
                                <i className="arrow right-button"></i>
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <p className='p-home'>Available spaces</p>
                            <div className="hidden-box" id="availablespaces" style={{ overflowY: 'auto', maxHeight: '278.517px', maxWidth: '294px', scrollbarWidth: 'thin', scrollbarGutter: 'auto'}}>
                            </div>
                        </div>
                    </div>
                    <img src={PeopleImg} alt="People" className="people-image"/>
                    <span style={{fontSize: "18px", paddingRight: "10px"}}>
                        {this.state.loading ? <em>Loading...</em> : <span>{this.state.amount}</span>}
                    </span>
                    <button id="Attendancebtn" className={this.state.Attendancebtn ? "buttonFalse" : "buttonTrue"}
                            onClick={(e) => this.handleClick(e, 'btn', "Attendancebtn")}>Join
                    </button>
                </div>
                <div className="inner-div">
                    <h5>Upcoming Events</h5>
                    <div className="hidden-div-ev" id="hidden-div-uev"
                         style={{display: 'flex', borderBottom: 'none'}}>
                        <Events onSetState={this.ValueChange} buttonGet={this.state.buttonStates}/>
                    </div>

                </div>
                <div className="inner-div">
                    <h5>Attending Events</h5>
                    <div className="hidden-div-ev" id="hidden-div-ev"
                         style={{display: 'flex', borderBottom: 'none'}}>
                        <AttendingEvents sharedState={this.state.sharedState} buttonSet={this.ValueButtonChange}/>  
                    </div>
                </div>
            </div>
        );
    }
    
    /**
     * Checks if the user is in the office for a given date.
     * @param {Date} date - The date to check. If not provided, the current date will be used.
     * @returns {Promise<void>} - A promise that resolves when the check is completed.
     */
    async inOffice(date) {
        if(!date){
            date = new Date();
        }
        const email = await getCookie("user");
        await fetch(`/api/inoffice?Email=${email}&Day=${date.toJSON()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Bad request');
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                const date = new Date();
                // set the time to 23:59:59
                date.setHours(23, 59, 59, 0);
                // set the cookie
                document.cookie = "joined=true; expires=" + date.toUTCString() + "; path=/";
                document.getElementById("Attendancebtn").textContent = 'Leave';
                this.setState({ Attendancebtn: true });
            }
            else if (!data.message) {
                document.cookie = "joined=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.getElementById("Attendancebtn").textContent = 'Join';
                this.setState({ Attendancebtn: false });
            }
        }
        )
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


/**
 * Joins a day by sending a POST request to the server with the user's email and the selected day.
 * @param {Object} homeComponent - The home component object.
 * @param {Date} [date] - The selected date. If not provided, the current date will be used.
 * @returns {Promise<void>} - A promise that resolves when the join operation is completed.
 * @throws {Error} - If the server returns an error response.
 */
async function JoinDay(homeComponent, date) {
    try {
        let day = date;
        if(!date){
            day = new Date();
        }
        const email = await getCookie("user");

        const response = await fetch('/api/join', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "Email": email, "Day": day.toJSON() })
        });
        const json = await response.json();
     
        if (!response.ok) {
            throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        await People(homeComponent, date);
    } catch (error) {
        console.error('Error during JoinDay:', error);
    }
}

/**
 * Retrieves and renders a list of employees who are onsite on a given date.
 * 
 * @param {Object} homeComponent - The home component object.
 * @param {Date} date - The date for which to retrieve the list of employees. If not provided, the current date is used.
 * @returns {Promise<void>} - A promise that resolves once the employee list is rendered.
 * @throws {Error} - If there is an error during the retrieval or rendering process.
 */
 async function PeopleOnsite(homeComponent, date) {
    try {
        let root = homeComponent.root; // Access the root from homeComponent

        // Render the employeeList in the 'empsonsite' div
        const empsonsiteDiv = document.getElementById('empsonsite');
        if (!root) {
            root = createRoot(empsonsiteDiv);
            homeComponent.root = root; // Save the root to homeComponent for future access
        }

        // set currentday to the day of the week of date
        if(!date){
            date = new Date();
        }
        const response = await fetch('api/getempsonsite?day=' + date.toJSON());
        const data = await response.json();
        // sort data.employees by last name based on the first letter of the last name
        data.employees.sort((a, b) => a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase()));
        
        const employeeList = await Promise.all(data.employees.map(async (employee) => {
            let profilePicture;
            try {
                profilePicture = await ConvertToPicture(employee.profilePicture);
            } catch (error) {
                //console.error('Error loading profile picture:', error);
                profilePicture = null; // Use a placeholder image or handle the error accordingly
            }

            return (
                <div key={employee.email} style={{ display: 'flex', alignItems: 'center' }}>
                    {profilePicture
                        ? <img src={profilePicture.src} alt="Employee" style={{ maxWidth: '70px', maxHeight: '70px', paddingBottom: '4%', paddingTop: '4%' , margin: '0', borderRadius: '50%' }} />
                        : <img src={Logo} alt="Placeholder" style={{ maxWidth: '62px', maxHeight: '62px', paddingTop: '0', paddingBottom: '4%' }} />
                    }
                    <p style={{ paddingLeft: '4%' }}>{`${employee.firstName} ${employee.lastName}`}</p>

                    <p  style={{paddingLeft: '4%'}}>{`${employee.email}`}</p>
                </div>
            );
        }));

        root.render(employeeList);
    } catch (error) {
        console.error('Error during People:', error);
        // Set loading to false only in case of an error
        homeComponent.setState({ loading: false });
    }
}
/**
 * Converts a base64 encoded image to a picture object.
 * @param {string} base64 - The base64 encoded image.
 * @returns {Promise<HTMLImageElement>} A promise that resolves to the picture object.
 */
 async function ConvertToPicture(base64) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
        image.src = 'data:image/png;base64,' + base64;
    });
}
/**
 * Fetches data about people from the server and updates the state of the home component.
 * @param {Object} homeComponent - The home component instance.
 * @param {Date} date - The date for which to fetch the data. If not provided, the current date is used.
 * @returns {Promise<void>} - A promise that resolves when the data is fetched and the state is updated.
 */
async function People(homeComponent, date) {
    try {
        if (!date) {
            date = new Date();
        }
        const day = date.toJSON();
        const response = await fetch('api/onsite?day=' + day);
        const data = await response.json();
        const currentDateTime = new Date();

        if (currentDateTime.getDay() === 1 && currentDateTime.getHours() === 0 && currentDateTime.getMinutes() === 0 ||
            currentDateTime.getHours() === 0 && currentDateTime.getMinutes() === 0) {
            homeComponent.setState({ amount: 0, loading: false });
        } else {
            homeComponent.setState({ amount: data, loading: false });
        }
    } catch (error) {
        console.error('Error during People:', error);
        // Set loading to false only in case of an error
        homeComponent.setState({ loading: false });
    }
}

/**
 * Adds a profile picture (PFP) to the server for a given user.
 * @param {File} file - The image file to be uploaded as the profile picture.
 * @returns {Promise<void>} - A promise that resolves when the PFP is successfully uploaded.
 */
export async function addPFP(file) {
    try {
        let email = await getCookie("user");
        
        // Make the image to base64 string so that it can be sent to the server
        let reader = new FileReader();
        reader.onload = async function () {
            try {
                const base64 = reader.result.split(',')[1]; // Extract the base64 data from the result
                // Send the base64 string to the server
                const response = await fetch('/api/addpfp', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "Email": email, "Pfp": base64 })
                });

                const json = await response.json();
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                else {
                    // remove the photo from pfp 
                    //document.getElementById('selectedPfp').src = null;
                    document.getElementById('werks').textContent = json.message;
                    // wait for 3 seconds
                    await new Promise(r => setTimeout(r, 3000));
                    // remove the message
                    document.getElementById('werks').textContent = '';
                }
            } catch (error) {
                console.error('Error during addPFP:', error);
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error during addPFP:', error);
    }
}



