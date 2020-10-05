import React from 'react'
import { Link } from 'react-router-dom'
import partnercustomsoft from '../PartnerCustomSoft.png'
import iAgrinet from '../iAgrinet.jpg'
import broxel from '../Broxel.png'

const AhojCoinPage = () => (
    <section>
        <h1>Ahoj!</h1>
        <h2>It is the network.</h2>
        <p>We want to change the way to access financial services. Our mission is to empower more people around the world with efficient, transparent and censorship-resistant financial services.</p>
        <br/>
        <h2 className="red-text">Partners</h2>
        <img src={partnercustomsoft} alt="partner customsoft" />
        <br/>
        <h2 className="red-text">Clients</h2>
        <img src={iAgrinet} alt="iAgrinet" />
        <img src={broxel} alt="broxel" />
        <br/>
    </section>
)

export default AhojCoinPage