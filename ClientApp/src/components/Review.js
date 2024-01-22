import React,{useState} from 'react';
import "./Styling/ReviewScreen.css"
import ReviewableEventList from './ReviewableEventList';
import SuggestEvent from './SuggestEvent';
import DropDownBar from './DropDownBar';
import Achievements from './Achievements';


function Review(){
    return (
        <div className="main-div">
            <div className="text">
            <h1>Suggest event</h1>
            <hr className="hr-main"></hr> 
            </div>

                {/* <DropDownBar title='Review attended events'>
                    <ReviewableEventList/>
                </DropDownBar> */}

                <DropDownBar title='Suggest an event' initialState='true'>
                    <SuggestEvent/>
                </DropDownBar>
                {/* <DropDownBar title='Achievements'>
                    <Achievements/>
                </DropDownBar> */}
        </div>
    )
}

export {Review}

