import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Modal from 'react-modal'

import '../styles/app.css'

type Props = {
    imgURL: string
}

const App: React.FC<Props> = ({ imgURL }) => {
    useEffect(() => {
        Modal.setAppElement('#dc-root')
    }, [])

    useEffect(() => {
        return () => {
            document.getElementById('dc-root').style.display = 'none'
            document.body.classList.remove('locked')
        }
    }, [])

    const handleClose = () => {
        ReactDOM.unmountComponentAtNode(document.getElementById('dc-root'))
    }

    return (
        <Modal
            style={{ overlay: { backgroundColor: '#0008', zIndex: 99999999 } }}
            isOpen={true}
            onRequestClose={handleClose}
            shouldCloseOnOverlayClick={true}
        >
            <img src={imgURL} />
        </Modal>
    )
}

const Dim = styled.div`
    height: 500px;
    width: 100%;
`

export default App
