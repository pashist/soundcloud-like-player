import React from 'react';
import url from 'url';
import SharePanelItem from './share-panel-item';

export default class SharePanelItems extends React.Component {
    render() {
        if (!this.props.data) return null;
        let links = this.createLinks(this.props.data);
        return (
            <ul className="share-panel-items">
                {links.map(link => <SharePanelItem link={link} key={link.key}/>)}
            </ul>
        )
    }
    createLinks(data) {
        const utm = {
            utm_source: 'soundcloud',
            utm_campaign: 'wtshare',
            utm_content: data.permalink_url
        };
        return [
            {
                key: 'fb',
                href: this.buildUrl('https://www.facebook.com/v2.2/dialog/share', {
                    app_id: 19507961798,
                    display: 'popup',
                    redirect_uri: 'https://soundcloud.com/fb_popup_callback.html',
                    href: this.buildUrl(data.permalink_url, {...utm, utm_medium: 'Facebook'})
                }),
                title: 'Share to Facebook',
                popup: true
            },
            {
                key: 'twitter',
                href: this.buildUrl('http://twitter.com/share', {
                    text: `${data.title} by ${data.user.username} via soundcloud`,
                    url: this.buildUrl(data.permalink_url, {...utm, utm_medium: 'Twitter'})
                }),
                title: 'Share to Twitter',
                popup: true
            },
            {
                key: 'tumblr',
                href: this.buildUrl('http://www.tumblr.com/share/audio', {
                    externally_hosted_url: this.buildUrl(data.permalink_url, {...utm, utm_medium: 'tumblr'}),
                    posttype: 'audio',
                    tags: `SoundCloud,music,${data.user.username}`
                }),
                title: 'Share to tumblr',
                popup: true
            },
            {
                key: 'google',
                href: this.buildUrl('https://plus.google.com/share', {
                    url: this.buildUrl(data.permalink_url, {...utm, utm_medium: 'Google+'})
                }),
                title: 'Share to Google+',
                popup: true
            },
            {
                key: 'vk',
                href: this.buildUrl('http://vkontakte.ru/share.php', {
                    url: this.buildUrl(data.permalink_url, {...utm, utm_medium: 'VK'})
                }),
                title: 'Share to VK',
                popup: true
            },
            {
                key: 'email',
                href: this.buildUrl('mailto:', {
                    subject: data.title + ' - SoundCloud',
                    body: data.permalink_url
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