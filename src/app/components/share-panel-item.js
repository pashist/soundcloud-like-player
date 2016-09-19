import React from 'react';

export default class SharePanelItem extends React.Component {
    render() {
        let link = this.props.link;
        return (
            <li className="share-panel-item">
                <a className={'share-icon ' + link.key} 
                   href={link.href} 
                   target="_blank"
                   onClick={this.onClick.bind(this)} 
                   title={link.title} />
            </li>
        )
    }

    onClick(e) {
        if (this.props.link.popup) {
            e.preventDefault();
            const width = 550;
            const height = 300;
            let left = window.screenX + (window.outerWidth - width) / 2;
            let top = window.screenY + (window.outerHeight - height) / 2;
            window.open(e.target.href, '', `location=1,width=${width},height=${height},top=${top},left=${left},toolbar=no,scrollbars=yes`);
        }
    }
}