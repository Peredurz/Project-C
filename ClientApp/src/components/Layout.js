import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        const path = window.location.pathname;

        if (path === "/register" || path === "/login" || path === "/forgotpassword" || path.startsWith("/resetpassword")) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                    <div style={{ marginTop: '0',justifyContent:'center' }}>
                        <Container tag="main">
                            {this.props.children}
                        </Container>
                    </div>
                </div>
            )
        } else {
            return (
                <div style={{ position:'relative',display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="top-nav-div" style={{position: 'fixed' ,width: '120px', height: '100vh', top: '0', left: '0' }}>
                        <NavMenu />
                    </div>
                    <div className="layout-main">
                        <Container tag="main">
                            {this.props.children}
                        </Container>
                    </div>
                </div>
            );
        }
    }
}