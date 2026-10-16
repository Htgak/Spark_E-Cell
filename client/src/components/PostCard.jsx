import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { linkifyText } from './PostContent';

export default function PostCard({ post }) {
  const formattedDate = new Date(post.publishAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article className="post-card">
      <div>
        <div className="post-card-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={13} />
            {formattedDate}
          </span>
        </div>

        <h3 className="post-card-title">
          <Link to={`/post/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="post-card-excerpt">
          {linkifyText(post.excerpt || post.content)}
        </p>
      </div>

      <div className="post-card-footer">
        <span className="post-author">
          <User size={14} />
          {post.author || 'Spark E-Cell'}
        </span>

        <Link to={`/post/${post.id}`} className="read-more-btn">
          Read Story <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
