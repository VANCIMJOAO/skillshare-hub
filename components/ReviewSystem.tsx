// apps/web/components/ReviewSystem.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Star,
    User,
    Calendar,
    MessageCircle,
    TrendingUp,
    Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        [key: number]: number;
    };
}

interface ReviewSystemProps {
    workshopId: string;
    userCanReview?: boolean;
    showCreateForm?: boolean;
}

export default function ReviewSystem({
    workshopId,
    userCanReview = false,
    showCreateForm = true
}: ReviewSystemProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: ''
    });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [workshopId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reviews/workshop/${workshopId}`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.data.reviews);
                setStats(data.data.stats);
            }
        } catch (error) {
            console.error('Erro ao carregar reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async () => {
        if (newReview.rating === 0) {
            alert('Por favor, selecione uma nota');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    workshopId,
                    rating: newReview.rating,
                    comment: newReview.comment || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                setNewReview({ rating: 0, comment: '' });
                setShowForm(false);
                fetchReviews(); // Recarregar reviews
            } else {
                alert(data.message || 'Erro ao enviar avaliação');
            }
        } catch (error) {
            console.error('Erro ao enviar review:', error);
            alert('Erro ao enviar avaliação');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating: number, interactive = false, size = 'h-4 w-4') => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
                        onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: star })) : undefined}
                    />
                ))}
            </div>
        );
    };

    const getRatingPercentage = (rating: number) => {
        if (!stats || stats.totalReviews === 0) return 0;
        return (stats.ratingDistribution[rating] / stats.totalReviews) * 100;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estatísticas das Reviews */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            Avaliações dos Alunos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Média geral */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <div className="flex justify-center mb-2">
                                    {renderStars(Math.round(stats.averageRating), false, 'h-6 w-6')}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
                                </p>
                            </div>

                            {/* Distribuição das notas */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <div key={rating} className="flex items-center gap-3">
                                        <span className="text-sm font-medium w-3">{rating}</span>
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                                style={{ width: `${getRatingPercentage(rating)}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-8">
                                            {stats.ratingDistribution[rating]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Formulário para nova review */}
            {userCanReview && showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Avaliar Workshop</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!showForm ? (
                            <Button onClick={() => setShowForm(true)} className="w-full">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Escrever Avaliação
                            </Button>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Sua nota *
                                    </label>
                                    {renderStars(newReview.rating, true, 'h-8 w-8')}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Comentário (opcional)
                                    </label>
                                    <Textarea
                                        placeholder="Compartilhe sua experiência com este workshop..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={submitReview}
                                        disabled={submitting || newReview.rating === 0}
                                        className="flex-1"
                                    >
                                        {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Lista de Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Comentários ({reviews.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reviews.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhuma avaliação ainda.</p>
                            <p className="text-sm">Seja o primeiro a avaliar este workshop!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {review.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {review.user.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(review.createdAt), {
                                                            addSuffix: true,
                                                            locale: ptBR
                                                        })}
                                                    </div>
                                                </div>
                                                {renderStars(review.rating)}
                                            </div>

                                            {review.comment && (
                                                <p className="text-gray-700 leading-relaxed">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
