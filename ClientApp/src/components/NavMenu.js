import React, {Component, useEffect, useRef, useState} from 'react';
import './Styling/NavMenu.css';
import './Styling/HiddenMen.css';
import HomeLogo from "./Images/25694.png"
import Calendar from "./Images/calendar_check_icon_136844.png"
import CaveroLogo from "./Images/smallLogoNoBG.png"
import Settings from "./Images/3093000.png"
import Logout from "./Images/login_icon.png"
import Thumb from "./Images/3918101-200.png"
import useWindowDimensions from "./ScreenWidth";

const App = () => {
    const { width } = useWindowDimensions();
    const [showHtml, setShowHtml] = useState(false);
    const navRef = useRef(null);

    const handleButtonClick = () => {
        setShowHtml(!showHtml);
    };

    const handleLinkClick = () => {
        setShowHtml(false);
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                // Clicked outside the navigation bar
                setShowHtml(false);
            }
        };

        // Add event listener when the component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navRef]);
    if (width <= 1550) {
        return (
            <div className="big-div" >
                <section>
                    <div ref={navRef} className="inside-nav" style={{zIndex: '2'}}>
                        <button onClick={handleButtonClick} style={{position:'fixed',padding:'20px',backgroundColor:'#6A347F',display:`${showHtml ? 'none':'flex'}`}} >☰</button>
                        {showHtml && <div>
                            <nav className="navbar-div-hidden navbar-expand-lg" expand="lg">
                                <ul className="navbar-ul">
                                    <li>
                                        <img src={CaveroLogo} alt="Cavero" style={{width: '30%'}}/>
                                    </li>
                                    <li>
                                        <a href="/" onClick={handleLinkClick}>
                                            <div className="image">
                                                <img src={HomeLogo} alt="Home" style={{width: '30%'}}/>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/calendar" onClick={handleLinkClick}>
                                            <div className="image">
                                                <img src={Calendar} alt="Calendar" style={{width: '30%'}}/>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/settings" onClick={handleLinkClick}>
                                            <div className="image">
                                                <img src={Settings} alt="Settings" style={{width: '30%'}}/>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/suggestevent">
                                            <div className="image">
                                                <img src={Thumb} alt="Review" style={{width: '30%'}}/>
                                            </div>
                                        </a>
                                    </li>
                                    <li style={{borderBottom: '0px'}}>
                                        <a href="/login" onClick={handleLinkClick}>
                                            <div className="image">
                                                <img src={Logout} alt="Login" style={{width: '30%'}}/>
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>}
                    </div>
                </section>
            </div>
        )
    }
    else
    {

        return null;
    }
};
export class NavMenu extends Component {
  static displayName = NavMenu.name;
     
  constructor (props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
    };
  }

  toggleNavbar () {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    if(window.location.pathname === "/register" 
        || window.location.pathname === "/login" 
        || window.location.pathname === "/forgotpassword"
        || window.location.pathname === "/resetpassword")
    {
        return null;
    }
    return (
        <div>
        <App></App>
        <nav className="navbar-div navbar-expand-lg" expand="lg">
          <ul className="navbar-ul">
            <li>
                <img src={CaveroLogo} alt="Cavero" style={{ width: '30%' }}/>
            </li>
            <li>
                <a href="/">
                    <div className="image">
                          <img src={HomeLogo} alt="Home" style={{ width: '30%' }}/>
                    </div>
                </a>
            </li>
            <li>
                <a href="/calendar">
                    <div className="image">
                          <img src={Calendar} alt="Calendar" style={{ width: '30%' }}/>
                    </div>
                </a>
            </li>
            <li>
                <a href="/settings">
                    <div className="image">
                          <img src={Settings} alt="Settings" style={{ width: '30%' }}/>
                    </div>
                </a>
            </li>
              <li>
                  <a href="/suggestevent">
                      <div className="image">
                          <img src={Thumb} alt="Review" style={{ width: '30%' }}/>
                      </div>
                  </a>
              </li>
            <li style = {{borderBottom:'0px'}}>
                <a href="/login">
                    <div className="image">
                          <img src={Logout} alt="Login" style={{ width: '30%' }}/>
                    </div>
                </a>
            </li>
          </ul>
       </nav>
        </div>
    );
  }
}
