from django.urls import path
from .views import LoginView, ProfilView, ListeUtilisateursView, DetailUtilisateurView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('profil/', ProfilView.as_view(), name='profil'),
    path('utilisateurs/', ListeUtilisateursView.as_view(), name='liste-utilisateurs'),
    path('utilisateurs/<str:pk>/', DetailUtilisateurView.as_view(), name='detail-utilisateur'),
]