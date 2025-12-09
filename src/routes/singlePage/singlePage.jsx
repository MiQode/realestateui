import './singlePage.scss';
import Slider from '../../components/slider/Slider';
import Map from '../../components/map/Map';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from './../../lib/apiRequest';

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/login');
    }
    // AFTER REACT 19 UPDATE TO USEOPTIMISTIK HOOK
    setSaved((prev) => !prev);
    try {
      await apiRequest.post('/users/save', { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const handleSendMessage2 = async () => {
    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Don't allow messaging yourself
    // if (post.user.id === currentUser.id) {
    //   alert("You can't message yourself!");
    //   return;
    // }

    try {
      // Create or get existing chat with this user
      const res = await apiRequest.post('/chats', {
        receiverId: post.userId,
      });

      // Navigate to profile page and scroll to chat section
      navigate('/profile', {
        state: {
          openChatId: res.data.id,
          receiver: post.user,
        },
      });
    } catch (err) {
      console.log(err);
      alert('Failed to start conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check the actual property owner ID
    const ownerId = post.userId || post.user?.id;

    console.log('Current user:', currentUser.id);
    console.log('Post owner:', ownerId);
    console.log('Post data:', post); // Debug: see what's in post

    if (!ownerId) {
      alert('Cannot find post owner!');
      return;
    }

    if (ownerId === currentUser.id) {
      alert("You can't message yourself!");
      return;
    }

    try {
      const res = await apiRequest.post('/chats', {
        receiverId: ownerId,
      });

      console.log('Chat created:', res.data);

      navigate('/profile', {
        state: {
          openChatId: res.data.id,
          receiver: post.user,
        },
      });
    } catch (err) {
      console.error('Error creating chat:', err);
      console.error('Error response:', err.response?.data);
      alert(
        'Failed to start conversation: ' +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar} alt="" />
                <span>{post.user.username}</span>
              </div>
            </div>
            <div className="bottom">{post.postDetail.desc}</div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === 'owner' ? (
                  <p>Owner is responsibsle</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === 'allowed' ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + 'km'
                    : post.postDetail.school + 'm'}{' '}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button onClick={handleSendMessage}>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? '#fece51' : 'white',
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? 'Place Saved' : 'Save the Place'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
