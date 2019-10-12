// react core
import React, {useState, useEffect} from 'react';
import {
  useParams
} from "react-router-dom";
import ReactSVG from 'react-svg';

// material ui
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';

// custom components
import CircularLoader from '../components/CircularLoader';
import Video from '../components/Video';

// webex
import {generateJWT} from '../webex/auth';



import DevNet from './devnet.svg'
// css
import './ActiveMeeting.css';

const Webex = require('webex');
var log = require("loglevel");
log.setDefaultLevel(log.levels.TRACE);

let mediaSettings = {
  receiveVideo: true,
  receiveAudio: true,
  receiveShare: true,
  sendVideo: false,
  sendAudio: false,
  sendShare: false
};

const useStyles = makeStyles({
  card: {
    minWidth: '100%',
  },
  Toolbar: {
    backgroundColor: 'white',
  },
  videoContainer: {
    textAlign: "center",
    position: 'absolute',
    width: '100%',
    top: '64px',
    height: '100%',
  }
});
const MEETING_EVENTS = {
  error: 'error',
  selfGuestAdmitted: 'meeting:self:guestAdmitted',
  stoppedSharingLocal: 'meeting:stoppedSharingLocal',
}
const MEDIA_EVENTS = {
  ready: 'media:ready',
  stopped: 'media:stopped'
}
const MEMBERS_EVENTS = {
  membersUpdate: 'members:update',
}
const MEDIA_TYPES = {
  remoteShare: 'remoteShare',
}
function ActiveMeeting(props) {
    log.debug('active meeting component', props);

    const [deviceConnected, setDeviceConnected] = useState(false);
    const [meetingJoined, setMeetingJoined] = useState(false);
    const [remoteShareScreen, setRemoteShareScreen] = useState(null);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [webexReady, setWebexReady] = useState(null);
    const [jwt, setJWT] = useState(null);
    const [webex, setWebex] = useState(null);
    const [reload, setReload] = useState(null);
    let { id, name } = useParams();
    const classes = useStyles();

    const decodedName = Buffer.from(name, 'base64').toString('ascii');
    const initWebex = () => {
      const webexclient = Webex.init({
        config: {
          meetings: {
            deviceType: 'WEB'
          }
        }
      });
      setWebex(webexclient);
    }
    if (!webex) {
      initWebex();
    }
    const registerWebex = () => {
      if (jwt === null) {
        log.debug('unable to register webex without a jwt');
        return;
      }
      webex.authorization.requestAccessTokenFromJwt({jwt})
      .then(() => {
        if (webex.canAuthorize) {
          // Register our device with Webex cloud
          if (!webex.meetings.registered) {
            webex.meetings.register()
                  // Sync our meetings with existing meetings on the server
              .then(() => webex.meetings.syncMeetings())
              .then(() => {
                log.debug('device connected');
                setDeviceConnected(true);
              })
              .catch((err) => {
                log.error(err);
                throw err;
              });
          }
        } else{
          log.debug('unable to authorize webex device');
        }
      });
    };
    // bind necessary webex events to our meeting
    const bindMeetingEvents = (meeting) => {
      log.debug('binding meeting events');
        if (!meeting) {
          log.warn('no active meeting');
          return
        }
        log.debug('active meeting');
        meeting.on('error', (err) => {
          log.warn('error with meeting', err);
        });
        meeting.on(MEETING_EVENTS.selfGuestAdmitted, () => {
          log.debug('guest has been admitted to the meeting', 'media settings', mediaSettings);
          meeting.addMedia({
            mediaSettings
          })
        });
        meeting.on(MEETING_EVENTS.stoppedSharingLocal, () => {
          log.debug('media stoped sharing local');
          meeting.updateShare({
              sendShare: false,
              receiveShare: true
          });
        });
        // Handle media streams changes to ready state
        meeting.on(MEDIA_EVENTS.ready, (media) => {
          log.debug('new media event available', media);
          if (!media) {
            log.warn('no media');
            return;
          }
          if (media.type === MEDIA_TYPES.remoteShare) {
            // set remote share screen to the correct media stream
            log.debug('setting remote share screen to available media');
            setRemoteShareScreen(media.stream);
          }
        });
        // Handle media streams stopping
        meeting.on(MEDIA_EVENTS.stopped, (media) => {
          // Remove media streams
          log.debug('setting remote share screen to null');              
          setRemoteShareScreen(null);
        });
        // Update participant info
        meeting.members.on(MEMBERS_EVENTS.membersUpdate, (delta) => {
          log.debug('member update', delta);
        });
        meeting.on('all', (event) => {
          log.debug('generic meeting event', event);
        });
    }
    
    const shareLocalScreen = () => {
      if (activeMeeting !== null) {
          const shareMediaSettings = {
            receiveShare: true,
            sendShare: true
          };
          console.info('SHARE-SCREEN: Preparing to share screen via `getMediaStreams`');
          activeMeeting.getMediaStreams(shareMediaSettings)
              // `[, localShare]` is grabbing index 1 from the mediaSettingsResultsArray
              // and storing it in a variable called localShare.
              .then((mediaSettingsResultsArray) => {
                const [, localShare] = mediaSettingsResultsArray;
                console.info('SHARE-SCREEN: Add local share via `updateShare`');
                return activeMeeting.updateShare({
                  sendShare: true,
                  receiveShare: true,
                  stream: localShare
                });
              })
              .then(() => {
                console.info('SHARE-SCREEN: Screen successfully added to meeting.');
              })
              .catch((e) => {
                console.error('SHARE-SCREEN: Unable to share screen, error:');
                console.error(e);
              });
          }
          else {
            console.error('No active meeting available to share screen.');
          }
    };
    if (jwt == null) {
      log.debug('generating jwt for webex');
      const generatedJWT = generateJWT(name, decodedName);
      setJWT(generatedJWT);
    }
    if (jwt !== null) {
      log.debug('jwt is available, beginning registration');
      webex.once('ready', () => {
        log.debug('webex beginning to register');
        setWebexReady(true);
        registerWebex();
      });
    }
    if (deviceConnected && !meetingJoined) {
      webex.meetings.create(id).then((meeting) => {
        // Call our helper function for binding events to meetings
        bindMeetingEvents(meeting)
        meeting.join().then((result) => {

          log.debug('meeting joined result', result);
            // add media to the meeting
          meeting.addMedia({mediaSettings})
            .then((result) => {log.debug(result)})
            .catch(err => log.error(err));

          setMeetingJoined(true);
          setActiveMeeting(meeting);

        });
      });
    }
    log.debug('remoteShare available for rendering', remoteShareScreen)
    return (
        <div>
          <AppBar position="static">
            <Toolbar className={classes.Toolbar}>
              {remoteShareScreen !== null &&
                <Button size="small" color="primary" onClick={()=>(shareLocalScreen())}>Share
                </Button>
              }
                <Button size="small" color="primary" onClick={()=>(setReload(!reload))}>Reload
                </Button>
            </Toolbar>
          </AppBar>
            {!deviceConnected && 
              <div className="ActiveMeeting">
                {/* <ReactSVG src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" /> */}

                <CircularLoader/>
              </div>
            }
            <div className={classes.videoContainer}>
            {remoteShareScreen !== null &&
                <Video
                  srcObject={remoteShareScreen}
                />
            }
            </div>
        </div>
    )
}



export default ActiveMeeting;