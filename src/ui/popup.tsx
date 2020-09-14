import React from "react"
import ReactDOM from "react-dom"

import "../styles/popup.css"

class Hello extends React.Component {
    render() {
        return (
            <div className="popup-padded">
                <h1>Hello React</h1>
            </div>
        )
    }
}

// --------------

ReactDOM.render(
    <Hello />,
    document.getElementById('root')
)