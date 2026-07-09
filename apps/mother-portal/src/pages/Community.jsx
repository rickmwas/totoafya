import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, MessageSquare, ThumbsUp, Plus, User, Send } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';

export default function Community() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'pregnancy' | 'baby'
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Mary Mwangi',
      time: '3 hours ago',
      timeSw: 'Masaa 3 yaliyopita',
      title: 'Tips for managing morning sickness?',
      titleSw: 'Mbinu za kupunguza kichefuchefu asubuhi?',
      body: 'I am at 8 weeks and feeling very nauseous every morning. Ginger tea helps a bit but looking for other safe remedies.',
      bodySw: 'Niko kwenye wiki ya 8 na ninajisikia vibaya sana kila asubuhi. Chai ya tangawizi inasaidia kidogo lakini natafuta mbinu zingine salama.',
      category: 'general',
      likes: 12,
      comments: 5,
      hasLiked: false,
    },
    {
      id: 2,
      author: 'Amina Ouma',
      time: '1 day ago',
      timeSw: 'Jana',
      title: 'Best weaning foods in Kibera?',
      titleSw: 'Vyakula bora vya kuanza kumlisha mtoto Kibera?',
      body: 'My baby is turning 6 months next week! What locally available ingredients are best to start making porridge or purees?',
      bodySw: 'Mtoto wangu anafikisha miezi 6 wiki ijayo! Ni viungo gani vinavyopatikana hapa karibu ambavyo ni bora kuanza kutengenezea uji au chakula laini?',
      category: 'baby',
      likes: 24,
      comments: 11,
      hasLiked: false,
    },
    {
      id: 3,
      author: 'Florence Wambui',
      time: '2 days ago',
      timeSw: 'Siku 2 zilizopita',
      title: 'Missing a vaccination dose',
      titleSw: 'Kukosa awamu ya chanjo',
      body: 'My baby missed the 14-week polio vaccine because she had a mild fever. Is it safe to get it next week? Should I book clinic?',
      bodySw: 'Mtoto wangu alikosa chanjo ya polio ya wiki ya 14 kwa sababu alikuwa na homa kidogo. Je, ni salama kuipata wiki ijayo? Je, niweke miadi kliniki?',
      category: 'pregnancy',
      likes: 8,
      comments: 3,
      hasLiked: false,
    },
  ]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked,
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const post = {
      id: Date.now(),
      author: 'Amina (Me)',
      time: 'Just now',
      timeSw: 'Sasa hivi',
      title: newTitle,
      titleSw: newTitle,
      body: newBody,
      bodySw: newBody,
      category: activeTab,
      likes: 0,
      comments: 0,
      hasLiked: false,
    };

    setPosts([post, ...posts]);
    setNewTitle('');
    setNewBody('');
    setShowNewPost(false);
  };

  const filteredPosts = posts.filter(p => p.category === activeTab);

  return (
    <AppShell>
      <div className="bg-[#f7f9f7] min-h-screen pb-20 font-sans text-[#131714] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white border-b border-[#e5e7eb]">
          <Link to="/" className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-[#131714]" />
          </Link>
          <h1 className="text-[18px] font-extrabold text-[#131714]">
            {lang === 'sw' ? 'Jumuiya' : 'Community'}
          </h1>
          <button 
            className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            onClick={() => alert(lang === 'sw' ? 'Chaguo' : 'Options')}
          >
            <MoreVertical size={20} className="text-[#131714]" />
          </button>
        </div>

        {/* Tab switchers (Screen 12 Tabs) */}
        <div className="flex bg-[#f0f2f0] p-1.5 rounded-[18px] mx-4 my-5 border border-[#e5e7eb]">
          {[
            { key: 'general', label: lang === 'sw' ? 'Mada Kuu' : 'General' },
            { key: 'pregnancy', label: lang === 'sw' ? 'Ujauzito' : 'Pregnancy' },
            { key: 'baby', label: lang === 'sw' ? 'Malezi' : 'Child Care' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-bold rounded-[14px] transition-all ${
                activeTab === tab.key ? 'bg-white text-toto-black shadow-sm' : 'text-toto-gray hover:text-toto-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Post Input Overlay Form */}
        {showNewPost && (
          <div className="mx-4 mb-5 bg-white border border-[#e5e7eb] rounded-[32px] p-5 shadow-sm animate-fade-in">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <h3 className="text-[15px] font-extrabold text-toto-black px-1">
                {lang === 'sw' ? 'Uliza swali jipya' : 'Ask a new question'}
              </h3>
              <input
                type="text"
                placeholder={lang === 'sw' ? 'Kichwa cha habari...' : 'Topic title...'}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="h-12 px-4 bg-[#f7f9f7] border border-[#e5e7eb] rounded-[12px] text-[13.5px] outline-none focus:border-toto-teal font-bold"
              />
              <textarea
                placeholder={lang === 'sw' ? 'Eleza swali lako hapa...' : 'Describe your question in detail...'}
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                rows={3}
                className="p-4 bg-[#f7f9f7] border border-[#e5e7eb] rounded-[16px] text-[13.5px] outline-none focus:border-toto-teal font-semibold"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="flex-1 h-12 rounded-full border border-[#e5e7eb] text-[13px] font-bold text-toto-gray active:scale-95"
                >
                  {lang === 'sw' ? 'Futa' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-full bg-toto-teal text-white text-[13px] font-bold shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  {lang === 'sw' ? 'Tuma' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Discussions Feed */}
        <div className="px-4 flex flex-col gap-4">
          {filteredPosts.map(post => (
            <div 
              key={post.id}
              className="bg-white border border-[#e5e7eb] rounded-[28px] p-5 shadow-sm hover:border-toto-teal/15 transition-colors"
            >
              {/* Author & Timestamp */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-9 h-9 rounded-full bg-toto-teal/5 border border-toto-teal/10 flex items-center justify-center text-toto-teal font-extrabold text-[12.5px]">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-[#131714] leading-none">
                    {post.author}
                  </h4>
                  <span className="text-[10px] text-toto-gray font-semibold mt-1 inline-block">
                    {lang === 'sw' ? post.timeSw : post.time}
                  </span>
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="text-[15.5px] font-black text-[#131714] leading-snug">
                {lang === 'sw' ? post.titleSw : post.title}
              </h3>
              <p className="text-[13.5px] text-[#6e7772] mt-2 leading-relaxed font-semibold">
                {lang === 'sw' ? post.bodySw : post.body}
              </p>

              {/* Likes & Comments Counters */}
              <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-[#e5e7eb]/80">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-[12.5px] font-bold active:scale-95 transition-all ${
                    post.hasLiked ? 'text-toto-teal' : 'text-toto-gray hover:text-toto-teal'
                  }`}
                >
                  <ThumbsUp size={14} className={post.hasLiked ? 'fill-toto-teal' : ''} />
                  <span>{post.likes}</span>
                </button>
                
                <button 
                  onClick={() => alert(lang === 'sw' ? 'Soga ya majibu inakuja hivi karibuni!' : 'Reply feed feature coming soon!')}
                  className="flex items-center gap-1.5 text-[12.5px] font-bold text-toto-gray hover:text-toto-teal active:scale-95 transition-all"
                >
                  <MessageSquare size={14} />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action FAB button (Screen 12) */}
        {!showNewPost && (
          <button
            onClick={() => setShowNewPost(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-toto-teal hover:bg-toto-teal-dark active:scale-90 text-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 z-50"
          >
            <Plus size={24} />
          </button>
        )}

      </div>
    </AppShell>
  );
}
