import './SkeletonCard.css';

export default function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-img"></div>
            <div className="skeleton-info">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line origin"></div>
                <div className="skeleton-line price"></div>
            </div>
            <div className="skeleton-footer">
                <div className="skeleton-btn"></div>
            </div>
        </div>
    );
}
