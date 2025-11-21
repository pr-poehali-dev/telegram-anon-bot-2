import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question_text: string;
  created_at: string;
  answered: boolean;
  answer_text: string | null;
  answered_at: string | null;
}

const API_URL = 'https://functions.poehali.dev/b9897739-0c65-4ece-b383-e1967258928a';

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите вопрос',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: newQuestion }),
      });

      if (response.ok) {
        toast({
          title: 'Отлично!',
          description: 'Ваш вопрос отправлен',
        });
        setNewQuestion('');
        fetchQuestions();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить вопрос',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || selectedQuestion === null) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedQuestion, answer_text: answerText }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Ответ отправлен',
        });
        setAnswerText('');
        setSelectedQuestion(null);
        fetchQuestions();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ответ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы вошли как администратор',
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container max-w-4xl py-12 px-4">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 shadow-lg">
            <Icon name="MessageCircleQuestion" size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Анонимные Вопросы
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Задавайте вопросы анонимно и получайте ответы от администратора
          </p>
        </div>

        <Tabs defaultValue="ask" className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-card shadow-md">
            <TabsTrigger value="ask" className="text-base">
              <Icon name="Send" size={20} className="mr-2" />
              Задать вопрос
            </TabsTrigger>
            <TabsTrigger value="view" className="text-base">
              <Icon name="MessageSquare" size={20} className="mr-2" />
              Все вопросы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ask" className="space-y-6">
            <Card className="shadow-xl border-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Sparkles" size={24} className="text-primary" />
                  Ваш анонимный вопрос
                </CardTitle>
                <CardDescription className="text-base">
                  Задайте любой вопрос – ваша личность останется в секрете
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Введите ваш вопрос..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-32 text-base resize-none border-2 focus:border-primary transition-colors"
                />
                <Button
                  onClick={handleSubmitQuestion}
                  disabled={isLoading}
                  size="lg"
                  className="w-full text-base h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={20} className="mr-2" />
                      Отправить вопрос
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            {!isAdmin && (
              <Card className="shadow-xl border-2 border-primary/30 bg-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Shield" size={24} className="text-primary" />
                    Вход для администратора
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Пароль администратора"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    className="border-2"
                  />
                  <Button onClick={handleAdminLogin} className="shadow-md">
                    <Icon name="Lock" size={20} className="mr-2" />
                    Войти
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card className="shadow-xl">
                  <CardContent className="py-12 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-lg">Пока нет вопросов</p>
                  </CardContent>
                </Card>
              ) : (
                questions.map((q) => (
                  <Card key={q.id} className="shadow-lg hover:shadow-xl transition-shadow border-2 border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon name="HelpCircle" size={20} className="text-primary" />
                            Вопрос #{q.id}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {new Date(q.created_at).toLocaleString('ru-RU')}
                          </CardDescription>
                        </div>
                        <Badge variant={q.answered ? 'default' : 'secondary'} className="text-sm">
                          {q.answered ? (
                            <>
                              <Icon name="CheckCircle2" size={16} className="mr-1" />
                              Отвечен
                            </>
                          ) : (
                            <>
                              <Icon name="Clock" size={16} className="mr-1" />
                              Ожидает
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted p-4 rounded-xl border-l-4 border-primary">
                        <p className="text-base">{q.question_text}</p>
                      </div>

                      {q.answered && q.answer_text && (
                        <div className="bg-accent/50 p-4 rounded-xl border-l-4 border-accent-foreground">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="MessageSquare" size={18} className="text-accent-foreground" />
                            <span className="font-semibold text-sm text-accent-foreground">Ответ администратора:</span>
                          </div>
                          <p className="text-base">{q.answer_text}</p>
                          {q.answered_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(q.answered_at).toLocaleString('ru-RU')}
                            </p>
                          )}
                        </div>
                      )}

                      {isAdmin && !q.answered && (
                        <div className="space-y-3 pt-2">
                          {selectedQuestion === q.id ? (
                            <>
                              <Textarea
                                placeholder="Введите ваш ответ..."
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                className="min-h-24 border-2"
                              />
                              <div className="flex gap-2">
                                <Button onClick={handleSubmitAnswer} disabled={isLoading} className="flex-1">
                                  <Icon name="Send" size={18} className="mr-2" />
                                  Отправить ответ
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedQuestion(null);
                                    setAnswerText('');
                                  }}
                                  variant="outline"
                                >
                                  Отмена
                                </Button>
                              </div>
                            </>
                          ) : (
                            <Button
                              onClick={() => setSelectedQuestion(q.id)}
                              variant="outline"
                              className="w-full"
                            >
                              <Icon name="Reply" size={18} className="mr-2" />
                              Ответить на вопрос
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
