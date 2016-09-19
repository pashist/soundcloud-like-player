import React from 'react';
import url from 'url';
import SharePanelItem from './share-panel-item';

export default class SharePanelItems extends React.Component {
    render() {
        if (!this.props.track) return null;
        let links = this.createLinks(this.props.track);
        return (
            <ul className="share-panel-items">
                {links.map(link => <SharePanelItem link={link} key={link.key}/>)}
            </ul>
        )
    }
    createLinks(track) {
        const utm = {
            utm_source: 'soundcloud',
            utm_campaign: 'wtshare',
            utm_content: track.permalink_url
        };
        return [
            {
                key: 'fb',
                href: this.buildUrl('https://www.facebook.com/v2.2/dialog/share', {
                    app_id: 19507961798,
                    display: 'popup',
                    redirect_uri: 'https://soundcloud.com/fb_popup_callback.html',
                    href: this.buildUrl(track.permalink_url, {...utm, utm_medium: 'Facebook'})
                }),
                title: 'Share to Facebook',
                popup: true
            },
            {
                key: 'twitter',
                href: this.buildUrl('http://twitter.com/share', {
                    text: `${track.title} by ${track.user.username} via soundcloud`,
                    url: this.buildUrl(track.permalink_url, {...utm, utm_medium: 'Twitter'})
                }),
                title: 'Share to Twitter',
                popup: true
            },
            {
                key: 'tumblr',
                href: this.buildUrl('http://www.tumblr.com/share/audio', {
                    externally_hosted_url: this.buildUrl(track.permalink_url, {...utm, utm_medium: 'tumblr'}),
                    posttype: 'audio',
                    tags: `SoundCloud,music,${track.user.username}`
                }),
                title: 'Share to tumblr',
                popup: true
            },
            {
                key: 'google',
                href: this.buildUrl('https://plus.google.com/share', {
                    url: this.buildUrl(track.permalink_url, {...utm, utm_medium: 'Google+'})
                }),
                title: 'Share to Google+',
                popup: true
            },
            {
                key: 'vk',
                href: this.buildUrl('http://vkontakte.ru/share.php', {
                    url: this.buildUrl(track.permalink_url, {...utm, utm_medium: 'VK'})
                }),
                title: 'Share to VK',
                popup: true
            },
            {
                key: 'email',
                href: this.buildUrl('mailto:', {
                    subject: track.title + ' - SoundCloud',
                    body: track.permalink_url
                }),
                title: 'Share to Email'
            }
        ];
    }

    buildUrl(base, query) {
        let urlObject = url.parse(base);
        urlObject.query = query;
        return url.format(urlObject)
    }

}