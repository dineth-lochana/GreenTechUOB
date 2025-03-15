import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function ExtinguisherDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [extinguisherDetails, setExtinguisherDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExtinguisherDetails = async () => {
            const extinguisherDocRef = doc(db, 'fireExtinguishers', id);
            const docSnap = await getDoc(extinguisherDocRef);
            if (docSnap.exists()) {
                setExtinguisherDetails({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Extinguisher details not found');
            }
            setIsLoading(false);
        };

        fetchExtinguisherDetails();
    }, [id]);

    if (isLoading) {
        return <div>Loading details...</div>;
    }

    if (!extinguisherDetails) {
        return <div>Extinguisher not found</div>;
    }

    return (
        <div className="extinguisher-details-container">
            <div className="extinguisher-image-container">
                <img src={extinguisherDetails.image} alt={extinguisherDetails.name} className="extinguisher-details-image" />
            </div>
            <div className="extinguisher-details">
                <h2>{extinguisherDetails.name}</h2>
                <p><strong>Content:</strong> {extinguisherDetails.content}</p>
                <p><strong>Price:</strong> {extinguisherDetails.price}</p>
                <p><strong>Misc:</strong> {extinguisherDetails.misc}</p>
                <br />
                <br />
                <button onClick={() => handleShare(extinguisherDetails)}>Share</button>
                <br />
                <br />
                <button onClick={() => navigate('/fire-extinguishers')}>Back to Fire Extinguisher List</button>
            </div>
        </div>
    );
}

export default ExtinguisherDetails;
