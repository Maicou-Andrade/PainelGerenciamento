import React, { useState, useEffect } from 'react'
import { projetosAPI, pessoasAPI, atividadesAPI, subtarefasAPI, testConnection } from './api'

// Funções utilitárias para conversão de datas
const formatDateToBR = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
}

const formatDateToISO = (brDateString) => {
  if (!brDateString) return ''
  
  // Se já está no formato ISO (yyyy-mm-dd), retorna como está
  if (brDateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return brDateString
  }
  
  // Se está no formato dd/mm/yyyy, converte para ISO
  if (brDateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = brDateString.split('/')
    return `${year}-${month}-${day}`
  }
  
  return ''
}

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  
  // Se já está no formato ISO, retorna como está (para inputs type="date")
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString
  }
  
  // Se está no formato dd/mm/yyyy, converte para ISO
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return formatDateToISO(dateString)
  }
  
  return ''
}

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-'
  
  // Se está no formato ISO, converte para dd/mm/yyyy
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return formatDateToBR(dateString)
  }
  
  // Se já está no formato dd/mm/yyyy, retorna como está
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return dateString
  }
  
  return '-'
}

// Adicionando estilos CSS para animações
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: translateX(100px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
`

// Injetando os estilos no documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}

// Componente elegante para seleção múltipla de responsáveis
const ResponsaveisDropdown = ({ projeto, pessoas, updateProjeto, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedResponsaveis, setSelectedResponsaveis] = useState(() => {
    if (projeto.responsaveis && projeto.responsaveis.trim()) {
      // Permitir múltiplos responsáveis
      const responsaveis = projeto.responsaveis.split(', ').filter(r => r.trim())
      return responsaveis
    }
    return []
  })
  const [fieldRef, setFieldRef] = useState(null)

  // Sincronizar estado quando o projeto muda
  useEffect(() => {
    if (projeto.responsaveis && projeto.responsaveis.trim()) {
      const responsaveis = projeto.responsaveis.split(', ').filter(r => r.trim())
      setSelectedResponsaveis(responsaveis)
    } else {
      setSelectedResponsaveis([])
    }
  }, [projeto.responsaveis])

  const toggleDropdown = () => setIsOpen(!isOpen)

  const toggleResponsavel = (nomeCompleto) => {
    console.log('🔧 toggleResponsavel chamado:', {
      nomeCompleto,
      selectedResponsaveis: [...selectedResponsaveis],
      includes: selectedResponsaveis.includes(nomeCompleto)
    })
    
    let newSelected
    if (selectedResponsaveis.includes(nomeCompleto)) {
      // Se já está selecionado, remove
      newSelected = selectedResponsaveis.filter(r => r !== nomeCompleto)
      console.log('➖ Removendo responsável:', nomeCompleto)
    } else {
      // Se não está selecionado, adiciona à lista
      newSelected = [...selectedResponsaveis, nomeCompleto]
      console.log('➕ Adicionando responsável:', nomeCompleto)
    }
    
    console.log('📝 Nova seleção:', newSelected)
    setSelectedResponsaveis(newSelected)
    const valorParaSalvar = newSelected.join(', ')
    console.log('🔧 Salvando responsável:', {
      projetoId: projeto.id,
      valorAnterior: projeto.responsaveis,
      novoValor: valorParaSalvar,
      newSelected
    })
    updateProjeto(projeto.id, 'responsaveis', valorParaSalvar)
    // Não fechar dropdown para permitir múltiplas seleções
  }

  const pessoasAtivas = pessoas.filter(pessoa => pessoa.status === 'Ativo')

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Campo principal */}
      <div
        ref={setFieldRef}
        onClick={toggleDropdown}
        style={{
          background: hasError ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: hasError ? '2px solid #dc2626' : 'none',
          borderRadius: '12px',
          padding: '10px 14px',
          fontSize: '12px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: hasError ? '0 4px 15px rgba(220, 38, 38, 0.3)' : '0 4px 15px rgba(102, 126, 234, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '36px',
          transform: isOpen ? 'translateY(-1px)' : 'translateY(0)',
          ...(isOpen && {
            boxShadow: hasError ? '0 8px 25px rgba(220, 38, 38, 0.4)' : '0 8px 25px rgba(102, 126, 234, 0.3)',
            background: hasError ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)' : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
          })
        }}
      >
        <div style={{ flex: 1, textAlign: 'left' }}>
          {selectedResponsaveis.length === 0 ? (
            <span style={{ opacity: 0.8, fontStyle: 'italic' }}>
              Clique para selecionar responsável(is)
            </span>
          ) : selectedResponsaveis.length === 1 ? (
            <span style={{ fontWeight: '500' }}>
              {selectedResponsaveis[0]}
            </span>
          ) : (
            <span style={{ fontWeight: '500' }}>
              {selectedResponsaveis.length} responsáveis selecionados
            </span>
          )}
        </div>
        <div style={{
          marginLeft: '8px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </div>
      </div>

      {/* Tags dos responsáveis selecionados */}
      {selectedResponsaveis.length > 0 && (
        <div style={{
          marginTop: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {selectedResponsaveis.map((responsavel, index) => (
            <span
              key={index}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(240, 147, 251, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={(e) => {
                e.stopPropagation()
                toggleResponsavel(responsavel)
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 4px 12px rgba(240, 147, 251, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 2px 8px rgba(240, 147, 251, 0.3)'
              }}
            >
              {responsavel}
              <span style={{ fontSize: '8px', opacity: 0.8 }}>×</span>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown menu */}
      {isOpen && (
        <div style={{
           position: 'fixed',
           top: fieldRef ? `${fieldRef.getBoundingClientRect().bottom + 4}px` : '0px',
           left: fieldRef ? `${fieldRef.getBoundingClientRect().left}px` : '0px',
           background: 'white',
           borderRadius: '12px',
           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.08)',
           zIndex: 999999,
           border: '1px solid rgba(102, 126, 234, 0.1)',
           overflow: 'hidden',
           animation: 'dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
           width: fieldRef ? `${fieldRef.getBoundingClientRect().width}px` : '280px',
           maxHeight: '200px'
         }}>
          <style>
            {`
              @keyframes dropdownSlide {
                from {
                  opacity: 0;
                  transform: translateY(-10px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}
          </style>
          <div style={{
             height: '100%',
             overflowY: 'auto',
             padding: '12px 8px'
           }}>
            {pessoasAtivas.length === 0 ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
                Nenhuma pessoa ativa encontrada
              </div>
            ) : (
              pessoasAtivas.map(pessoa => {
                const isSelected = selectedResponsaveis.includes(pessoa.nomeCompleto)
                return (
                  <div
                    key={pessoa.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleResponsavel(pessoa.nomeCompleto)
                    }}
                    style={{
                       padding: '12px 14px',
                       borderRadius: '8px',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '12px',
                       fontSize: '12px',
                       background: isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                       color: isSelected ? 'white' : '#374151',
                       margin: '4px 0'
                     }}
                    onMouseEnter={(e) => {
                      e.stopPropagation()
                      if (!isSelected) {
                        e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                        e.target.style.transform = 'translateX(2px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      if (!isSelected) {
                        e.target.style.background = 'transparent'
                        e.target.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: isSelected ? 'none' : '2px solid #d1d5db',
                      background: isSelected ? 'white' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: isSelected ? '#667eea' : 'transparent',
                      fontWeight: 'bold'
                    }}>
                      {isSelected ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>
                        {pessoa.nomeCompleto}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        opacity: 0.7,
                        marginTop: '2px'
                      }}>
                        {pessoa.cargo} • {pessoa.departamento}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Componente compacto para seleção de responsáveis de tarefa
const ResponsaveisTarefaDropdown = ({ atividade, pessoas, updateAtividade, disabled = false, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedResponsaveis, setSelectedResponsaveis] = useState(
    atividade.responsaveisTarefa ? atividade.responsaveisTarefa.split(', ').filter(r => r.trim()) : []
  )

  // Sincronizar estado local com dados da atividade quando ela mudar
  useEffect(() => {
    const novosResponsaveis = atividade.responsaveisTarefa ? atividade.responsaveisTarefa.split(', ').filter(r => r.trim()) : []
    setSelectedResponsaveis(novosResponsaveis)
  }, [atividade.responsaveisTarefa])

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const toggleResponsavel = (nomeCompleto) => {
    console.log('🔧 toggleResponsavel (atividade) chamado:', {
      nomeCompleto,
      selectedResponsaveis: [...selectedResponsaveis],
      includes: selectedResponsaveis.includes(nomeCompleto)
    })
    
    let newSelected
    if (selectedResponsaveis.includes(nomeCompleto)) {
      newSelected = selectedResponsaveis.filter(r => r !== nomeCompleto)
      console.log('➖ Removendo responsável (atividade):', nomeCompleto)
    } else {
      newSelected = [...selectedResponsaveis, nomeCompleto]
      console.log('➕ Adicionando responsável (atividade):', nomeCompleto)
    }
    
    console.log('📝 Nova seleção (atividade):', newSelected)
    setSelectedResponsaveis(newSelected)
    updateAtividade(atividade.id, 'responsaveisTarefa', newSelected.join(', '))
  }

  const pessoasAtivas = pessoas.filter(pessoa => pessoa.status === 'Ativo')

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Campo principal compacto */}
      <div
        onClick={toggleDropdown}
        style={{
          background: disabled ? '#f3f4f6' : hasError ? '#fef2f2' : '#fef3c7',
          border: hasError ? '2px solid #dc2626' : `1px solid ${disabled ? '#d1d5db' : '#e5e7eb'}`,
          boxShadow: hasError ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : 'none',
          borderRadius: '6px',
          padding: '6px 8px',
          fontSize: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          color: disabled ? '#9ca3af' : '#000',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '32px'
        }}
      >
        <div style={{ flex: 1, textAlign: 'left' }}>
          {selectedResponsaveis.length === 0 ? (
            <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
              Selecionar...
            </span>
          ) : selectedResponsaveis.length === 1 ? (
            <span style={{ fontWeight: '500' }}>
              {selectedResponsaveis[0]}
            </span>
          ) : (
            <span style={{ fontWeight: '500' }}>
              {selectedResponsaveis.length} pessoas
            </span>
          )}
        </div>
        <div style={{
          marginLeft: '4px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '10px'
        }}>
          ▼
        </div>
      </div>

      {/* Dropdown menu compacto */}
      {isOpen && (
        <div style={{
           position: 'absolute',
           top: '100%',
           left: 0,
           right: 0,
           background: 'white',
           borderRadius: '6px',
           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
           zIndex: 1000,
           marginTop: '2px',
           border: '1px solid #e5e7eb',
           overflow: 'hidden'
         }}>
          <div style={{
             maxHeight: '200px',
             overflowY: 'auto',
             padding: '4px'
           }}>
            {pessoasAtivas.length === 0 ? (
              <div style={{
                padding: '8px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '11px',
                fontStyle: 'italic'
              }}>
                Nenhuma pessoa ativa
              </div>
            ) : (
              pessoasAtivas.map(pessoa => {
                const isSelected = selectedResponsaveis.includes(pessoa.nomeCompleto)
                return (
                  <div
                    key={pessoa.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleResponsavel(pessoa.nomeCompleto)
                    }}
                    style={{
                       padding: '6px 8px',
                       borderRadius: '4px',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '6px',
                       fontSize: '11px',
                       background: isSelected ? '#e0f2fe' : 'transparent',
                       color: isSelected ? '#0369a1' : '#374151',
                       margin: '1px 0'
                     }}
                    onMouseEnter={(e) => {
                      e.stopPropagation()
                      if (!isSelected) {
                        e.target.style.background = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      if (!isSelected) {
                        e.target.style.background = 'transparent'
                      }
                    }}
                  >
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      border: isSelected ? 'none' : '1px solid #d1d5db',
                      background: isSelected ? '#0369a1' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {isSelected ? '✓' : ''}
                    </div>
                    <div style={{ flex: 1, fontWeight: '500' }}>
                      {pessoa.nomeCompleto}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Componente de Modal Personalizado para Confirmações
const ConfirmationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '💾'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      default:
        return '#3b82f6'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.3s ease-out',
          border: `3px solid ${getColor()}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              display: 'inline-block',
              padding: '16px',
              borderRadius: '50%',
              backgroundColor: `${getColor()}15`,
              border: `2px solid ${getColor()}30`
            }}
          >
            {getIcon()}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}
          >
            {message}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: getColor(),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 12px ${getColor()}30`
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = `0 8px 20px ${getColor()}40`
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = `0 4px 12px ${getColor()}30`
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente de Modal de Confirmação com Sim/Não
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, projectName }) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.3s ease-out',
          border: '3px solid #ef4444'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              display: 'inline-block',
              padding: '16px',
              borderRadius: '50%',
              backgroundColor: '#ef444415',
              border: '2px solid #ef444430'
            }}
          >
            🗑️
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '16px',
              color: '#6b7280',
              lineHeight: '1.5',
              marginBottom: '8px'
            }}
          >
            {message}
          </p>
          {projectName && (
            <p
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ef4444',
                lineHeight: '1.5'
              }}
            >
              "{projectName}"
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px #6b728030'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4b5563'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6b7280'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px #ef444430'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#dc2626'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ef4444'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Sim, Remover
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('pessoas')
  const [projetos, setProjetos] = useState([])
  const [pessoas, setPessoas] = useState([])
  const [atividades, setAtividades] = useState([])
  const [subtarefas, setSubtarefas] = useState([])
  
  // Estados para modal de criação de tarefas em lote
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false)
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState('')
  const [taskQuantity, setTaskQuantity] = useState(1)
  
  // Estados para modal de criação de atividades
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedProjectForActivity, setSelectedProjectForActivity] = useState('')
  const [activityQuantity, setActivityQuantity] = useState(1)
  
  // Estado para edição inline de atividades
  const [editingActivity, setEditingActivity] = useState(null)
  
  // Estado para mensagem de salvamento
  const [showSaveMessage, setShowSaveMessage] = useState(false)
  
  // Estado para controlar campos com erro (destaque vermelho)
  const [camposComErro, setCamposComErro] = useState({})
  const [camposComErroAtividades, setCamposComErroAtividades] = useState({})
  
  // Estados para modal de erros de validação
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState([])
  
  // Estados para controle de alterações pendentes
  const [alteracoesPendentes, setAlteracoesPendentes] = useState({
    projetos: new Set(),
    atividades: new Set(),
    pessoas: new Set()
  })
  const [salvandoTudo, setSalvandoTudo] = useState(false)
  
  // Estados para modal de confirmação personalizado
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationModalData, setConfirmationModalData] = useState({
    title: '',
    message: '',
    type: 'success'
  })

  // Estados para modal de confirmação de remoção
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteModalData, setDeleteModalData] = useState({
    projectId: null,
    projectName: '',
    title: '',
    message: ''
  })

  // Estados para filtros dos indicadores
  const [filtrosProjeto, setFiltrosProjeto] = useState('')
  const [filtrosResponsavelProjeto, setFiltrosResponsavelProjeto] = useState('')
  const [filtrosResponsavelAtividade, setFiltrosResponsavelAtividade] = useState('')
  const [filtrosStatus, setFiltrosStatus] = useState('')
  const [filtrosStatusPrazo, setFiltrosStatusPrazo] = useState('')

  // Função auxiliar para mostrar modal de confirmação
  const showModal = (title, message, type = 'success') => {
    setConfirmationModalData({ title, message, type })
    setShowConfirmationModal(true)
  }

  const closeModal = () => {
    setShowConfirmationModal(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])



  // Comentado: Salva dados automaticamente quando há mudanças
  // useEffect(() => {
  //   if (projetos.length > 0 || pessoas.length > 0 || atividades.length > 0 || subtarefas.length > 0) {
  //     salvarDados()
  //   }
  // }, [projetos, pessoas, atividades, subtarefas])

  const conectarDadosExemplo = async () => {
    console.log('🔄 INICIANDO CARREGAMENTO DE DADOS DE EXEMPLO');
    
    try {
      console.log('📡 Verificando dados existentes na API...');
      // Verificar se já existem dados na API
      const [pessoasExistentes, projetosExistentes, atividadesExistentes] = await Promise.all([
        pessoasAPI.getAll().catch(() => []),
        projetosAPI.getAll().catch(() => []),
        atividadesAPI.getAll().catch(() => [])
      ])
      
      console.log('📊 Dados encontrados:', {
        pessoas: pessoasExistentes.length,
        projetos: projetosExistentes.length,
        atividades: atividadesExistentes.length
      });

      // Se já existem dados, apenas carregá-los
      if (pessoasExistentes.length > 0 || projetosExistentes.length > 0 || atividadesExistentes.length > 0) {
        console.log('📋 Dados já existem na API, carregando...')
        console.log('🔄 Entrando no bloco de dados existentes');
        
        // Mapear pessoas para incluir nomeCompleto se não existir
        const pessoasMapeadas = pessoasExistentes.map(pessoa => ({
          ...pessoa,
          nomeCompleto: pessoa.nomeCompleto || pessoa.nome
        }))
        
        setPessoas(pessoasMapeadas)
        setProjetos(projetosExistentes)
        setAtividades(atividadesExistentes)
        console.log('✅ DADOS EXISTENTES CARREGADOS DA API')
        return
      }

      // Se não existem dados, criar dados de exemplo
      console.log('📝 Criando dados de exemplo...')
      
      // Força a limpeza de todos os estados
      setProjetos([])
      setPessoas([])
      setAtividades([])
      setSubtarefas([])
      console.log('✅ Estados limpos');
      
      // Dados de exemplo para pessoas (expandido com 3 novos nomes)
      const pessoasExemplo = [
        {
          codigo: 'PES001',
          nome: 'João Silva',
          nomeCompleto: 'João Silva',
          email: 'joao.silva@empresa.com',
          cargo: 'Analista de Sistemas',
          departamento: 'TI',
          status: 'Ativo'
        },
        {
          codigo: 'PES002',
          nome: 'Maria Santos',
          nomeCompleto: 'Maria Santos',
          email: 'maria.santos@empresa.com',
          cargo: 'Designer UX/UI',
          departamento: 'Design',
          status: 'Ativo'
        },
        {
          codigo: 'PES003',
          nome: 'Carlos Oliveira',
          nomeCompleto: 'Carlos Oliveira',
          email: 'carlos.oliveira@empresa.com',
          cargo: 'Gerente de Projetos',
          departamento: 'Gestão',
          status: 'Ativo'
        },
        {
          codigo: 'PES004',
          nome: 'Ana Costa',
          nomeCompleto: 'Ana Costa',
          email: 'ana.costa@empresa.com',
          cargo: 'Desenvolvedora Frontend',
          departamento: 'TI',
          status: 'Ativo'
        },
        {
          codigo: 'PES005',
          nome: 'Pedro Almeida',
          nomeCompleto: 'Pedro Almeida',
          email: 'pedro.almeida@empresa.com',
          cargo: 'Analista de Qualidade',
          departamento: 'QA',
          status: 'Ativo'
        }
      ]

      // Dados de exemplo para projetos (10 projetos, cada um com 2 responsáveis, todos aprovados)
      const projetosExemplo = [
        {
          codigo: 'PRJ001',
          nome: 'Sistema de Gestão Empresarial',
          responsaveis: 'João Silva, Maria Santos',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          status: 'Aprovado',
          progresso: 65,
          observacoes: 'Sistema completo de gestão empresarial com módulos integrados'
        },
        {
          codigo: 'PRJ002',
          nome: 'Portal do Cliente',
          responsaveis: 'Carlos Oliveira, Ana Costa',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-08-31',
          status: 'Aprovado',
          progresso: 45,
          observacoes: 'Portal web para atendimento e autoatendimento de clientes'
        },
        {
          codigo: 'PRJ003',
          nome: 'App Mobile Vendas',
          responsaveis: 'Pedro Almeida, João Silva',
          inicioPlaneado: '2024-03-01',
          fimPlaneado: '2024-09-30',
          status: 'Aprovado',
          progresso: 30,
          observacoes: 'Aplicativo móvel para equipe de vendas externa'
        },
        {
          codigo: 'PRJ004',
          nome: 'Sistema de BI e Relatórios',
          responsaveis: 'Maria Santos, Carlos Oliveira',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-07-15',
          status: 'Aprovado',
          progresso: 80,
          observacoes: 'Business Intelligence com dashboards executivos'
        },
        {
          codigo: 'PRJ005',
          nome: 'Plataforma E-learning',
          responsaveis: 'Ana Costa, Pedro Almeida',
          inicioPlaneado: '2024-04-01',
          fimPlaneado: '2024-12-31',
          status: 'Aprovado',
          progresso: 20,
          observacoes: 'Plataforma de ensino à distância para treinamentos'
        },
        {
          codigo: 'PRJ006',
          nome: 'Sistema de Estoque',
          responsaveis: 'João Silva, Ana Costa',
          inicioPlaneado: '2024-02-15',
          fimPlaneado: '2024-08-15',
          status: 'Aprovado',
          progresso: 55,
          observacoes: 'Controle automatizado de estoque e inventário'
        },
        {
          codigo: 'PRJ007',
          nome: 'Portal de Fornecedores',
          responsaveis: 'Carlos Oliveira, Maria Santos',
          inicioPlaneado: '2024-05-01',
          fimPlaneado: '2024-11-30',
          status: 'Aprovado',
          progresso: 15,
          observacoes: 'Portal para gestão de relacionamento com fornecedores'
        },
        {
          codigo: 'PRJ008',
          nome: 'Sistema de RH Digital',
          responsaveis: 'Pedro Almeida, Maria Santos',
          inicioPlaneado: '2024-03-15',
          fimPlaneado: '2024-10-15',
          status: 'Aprovado',
          progresso: 40,
          observacoes: 'Digitalização completa dos processos de recursos humanos'
        },
        {
          codigo: 'PRJ009',
          nome: 'API Gateway Corporativo',
          responsaveis: 'Ana Costa, João Silva',
          inicioPlaneado: '2024-06-01',
          fimPlaneado: '2024-12-31',
          status: 'Aprovado',
          progresso: 10,
          observacoes: 'Gateway centralizado para todas as APIs da empresa'
        },
        {
          codigo: 'PRJ010',
          nome: 'Sistema de Segurança Digital',
          responsaveis: 'Carlos Oliveira, Pedro Almeida',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-05-31',
          status: 'Aprovado',
          progresso: 90,
          observacoes: 'Implementação de segurança cibernética avançada'
        }
      ]

      // Dados de exemplo para atividades (50 atividades - 5 por projeto)
      const atividadesExemplo = [
        // PRJ001 - Sistema de Gestão Empresarial (João Silva, Maria Santos)
        {
          codigo: 'AT001',
          codigoProjeto: 'PRJ001 - Sistema de Gestão Empresarial',
          projeto: 'Sistema de Gestão Empresarial',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          tarefa: 'Análise de Requisitos',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 15,
          dataInicio: '2024-01-15',
          previsaoEntrega: '2024-01-30',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 105,
          horasUtilizadas: 95,
          diferencaHoras: -10,
          observacoes: 'Levantamento de requisitos funcionais completo',
          nome: 'Análise de Requisitos',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT002',
          codigoProjeto: 'PRJ001 - Sistema de Gestão Empresarial',
          projeto: 'Sistema de Gestão Empresarial',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          tarefa: 'Design da Interface',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 10,
          dataInicio: '2024-02-01',
          previsaoEntrega: '2024-02-15',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 75,
          qtdHoras: 70,
          horasUtilizadas: 50,
          diferencaHoras: -20,
          observacoes: 'Interface responsiva em desenvolvimento',
          nome: 'Design da Interface',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT003',
          codigoProjeto: 'PRJ001 - Sistema de Gestão Empresarial',
          projeto: 'Sistema de Gestão Empresarial',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          tarefa: 'Desenvolvimento Backend',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 30,
          dataInicio: '2024-02-15',
          previsaoEntrega: '2024-03-20',
          status: 'Em Andamento',
          statusPrazo: 'Fora do Prazo',
          progresso: 60,
          qtdHoras: 200,
          horasUtilizadas: 180,
          diferencaHoras: -20,
          observacoes: 'APIs principais em desenvolvimento',
          nome: 'Desenvolvimento Backend',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT004',
          codigoProjeto: 'PRJ001 - Sistema de Gestão Empresarial',
          projeto: 'Sistema de Gestão Empresarial',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          tarefa: 'Testes de Integração',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 12,
          dataInicio: '2024-04-01',
          previsaoEntrega: '2024-04-15',
          status: 'Cancelada',
          statusPrazo: 'Dentro do Prazo',
          progresso: 0,
          qtdHoras: 80,
          horasUtilizadas: 0,
          diferencaHoras: -80,
          observacoes: 'Cancelada devido a mudança de escopo',
          nome: 'Testes de Integração',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT005',
          codigoProjeto: 'PRJ001 - Sistema de Gestão Empresarial',
          projeto: 'Sistema de Gestão Empresarial',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          tarefa: 'Deploy e Configuração',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 8,
          dataInicio: '2024-05-01',
          previsaoEntrega: '2024-05-10',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 30,
          qtdHoras: 60,
          horasUtilizadas: 20,
          diferencaHoras: -40,
          observacoes: 'Configuração de ambiente de produção',
          nome: 'Deploy e Configuração',
          responsavel: 'João Silva'
        },

        // PRJ002 - Portal do Cliente (Carlos Oliveira, Ana Costa)
        {
          codigo: 'AT006',
          codigoProjeto: 'PRJ002 - Portal do Cliente',
          projeto: 'Portal do Cliente',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-08-31',
          tarefa: 'Planejamento UX',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 20,
          dataInicio: '2024-02-01',
          previsaoEntrega: '2024-02-25',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 140,
          horasUtilizadas: 135,
          diferencaHoras: -5,
          observacoes: 'Wireframes e protótipos aprovados',
          nome: 'Planejamento UX',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT007',
          codigoProjeto: 'PRJ002 - Portal do Cliente',
          projeto: 'Portal do Cliente',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-08-31',
          tarefa: 'Desenvolvimento Frontend',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 45,
          dataInicio: '2024-03-01',
          previsaoEntrega: '2024-04-20',
          status: 'Em Andamento',
          statusPrazo: 'Fora do Prazo',
          progresso: 65,
          qtdHoras: 300,
          horasUtilizadas: 280,
          diferencaHoras: -20,
          observacoes: 'Componentes React em desenvolvimento',
          nome: 'Desenvolvimento Frontend',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT008',
          codigoProjeto: 'PRJ002 - Portal do Cliente',
          projeto: 'Portal do Cliente',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-08-31',
          tarefa: 'Integração com APIs',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 25,
          dataInicio: '2024-04-15',
          previsaoEntrega: '2024-05-15',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 40,
          qtdHoras: 175,
          horasUtilizadas: 70,
          diferencaHoras: -105,
          observacoes: 'Conectando com sistemas legados',
          nome: 'Integração com APIs',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT009',
          codigoProjeto: 'PRJ002 - Portal do Cliente',
          projeto: 'Portal do Cliente',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-08-31',
          tarefa: 'Testes de Usabilidade',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 15,
          dataInicio: '2024-06-01',
          previsaoEntrega: '2024-06-20',
          status: 'Cancelada',
          statusPrazo: 'Dentro do Prazo',
          progresso: 0,
          qtdHoras: 100,
          horasUtilizadas: 0,
          diferencaHoras: -100,
          observacoes: 'Substituída por testes automatizados',
          nome: 'Testes de Usabilidade',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT010',
          codigoProjeto: 'PRJ002 - Portal do Cliente',
          projeto: 'Portal do Cliente',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-08-31',
          tarefa: 'Documentação Técnica',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 10,
          dataInicio: '2024-07-01',
          previsaoEntrega: '2024-07-15',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 20,
          qtdHoras: 70,
          horasUtilizadas: 15,
          diferencaHoras: -55,
          observacoes: 'Manual técnico e de usuário',
          nome: 'Documentação Técnica',
          responsavel: 'Carlos Oliveira'
        },

        // PRJ003 - App Mobile Vendas (Pedro Almeida, João Silva)
        {
          codigo: 'AT011',
          codigoProjeto: 'PRJ003 - App Mobile Vendas',
          projeto: 'App Mobile Vendas',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-03-01',
          fimPlaneado: '2024-09-30',
          tarefa: 'Pesquisa de Mercado',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 18,
          dataInicio: '2024-03-01',
          previsaoEntrega: '2024-03-22',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 120,
          horasUtilizadas: 115,
          diferencaHoras: -5,
          observacoes: 'Análise de concorrentes e necessidades',
          nome: 'Pesquisa de Mercado',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT012',
          codigoProjeto: 'PRJ003 - App Mobile Vendas',
          projeto: 'App Mobile Vendas',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-03-01',
          fimPlaneado: '2024-09-30',
          tarefa: 'Arquitetura do App',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 12,
          dataInicio: '2024-03-25',
          previsaoEntrega: '2024-04-08',
          status: 'Concluída',
          statusPrazo: 'Fora do Prazo',
          progresso: 100,
          qtdHoras: 85,
          horasUtilizadas: 95,
          diferencaHoras: 10,
          observacoes: 'Definição da arquitetura React Native',
          nome: 'Arquitetura do App',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT013',
          codigoProjeto: 'PRJ003 - App Mobile Vendas',
          projeto: 'App Mobile Vendas',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-03-01',
          fimPlaneado: '2024-09-30',
          tarefa: 'Desenvolvimento iOS',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 60,
          dataInicio: '2024-04-15',
          previsaoEntrega: '2024-06-20',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 45,
          qtdHoras: 400,
          horasUtilizadas: 180,
          diferencaHoras: -220,
          observacoes: 'Desenvolvimento nativo iOS',
          nome: 'Desenvolvimento iOS',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT014',
          codigoProjeto: 'PRJ003 - App Mobile Vendas',
          projeto: 'App Mobile Vendas',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-03-01',
          fimPlaneado: '2024-09-30',
          tarefa: 'Desenvolvimento Android',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 60,
          dataInicio: '2024-04-15',
          previsaoEntrega: '2024-06-20',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 50,
          qtdHoras: 400,
          horasUtilizadas: 200,
          diferencaHoras: -200,
          observacoes: 'Desenvolvimento nativo Android',
          nome: 'Desenvolvimento Android',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT015',
          codigoProjeto: 'PRJ003 - App Mobile Vendas',
          projeto: 'App Mobile Vendas',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-03-01',
          fimPlaneado: '2024-09-30',
          tarefa: 'Testes Beta',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 20,
          dataInicio: '2024-07-01',
          previsaoEntrega: '2024-07-25',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 10,
          qtdHoras: 140,
          horasUtilizadas: 15,
          diferencaHoras: -125,
          observacoes: 'Testes com usuários beta',
          nome: 'Testes Beta',
          responsavel: 'Pedro Almeida'
        },

        // PRJ004 - Sistema de BI e Relatórios (Maria Santos, Carlos Oliveira)
        {
          codigo: 'AT016',
          codigoProjeto: 'PRJ004 - Sistema de BI e Relatórios',
          projeto: 'Sistema de BI e Relatórios',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-07-15',
          tarefa: 'Modelagem de Dados',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 25,
          dataInicio: '2024-01-15',
          previsaoEntrega: '2024-02-15',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 175,
          horasUtilizadas: 170,
          diferencaHoras: -5,
          observacoes: 'Data warehouse modelado',
          nome: 'Modelagem de Dados',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT017',
          codigoProjeto: 'PRJ004 - Sistema de BI e Relatórios',
          projeto: 'Sistema de BI e Relatórios',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-07-15',
          tarefa: 'ETL Development',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 35,
          dataInicio: '2024-02-20',
          previsaoEntrega: '2024-04-01',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 245,
          horasUtilizadas: 240,
          diferencaHoras: -5,
          observacoes: 'Processos ETL implementados',
          nome: 'ETL Development',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT018',
          codigoProjeto: 'PRJ004 - Sistema de BI e Relatórios',
          projeto: 'Sistema de BI e Relatórios',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-07-15',
          tarefa: 'Dashboards Executivos',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 30,
          dataInicio: '2024-04-05',
          previsaoEntrega: '2024-05-10',
          status: 'Em Andamento',
          statusPrazo: 'Fora do Prazo',
          progresso: 85,
          qtdHoras: 210,
          horasUtilizadas: 190,
          diferencaHoras: -20,
          observacoes: 'Dashboards interativos em Power BI',
          nome: 'Dashboards Executivos',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT019',
          codigoProjeto: 'PRJ004 - Sistema de BI e Relatórios',
          projeto: 'Sistema de BI e Relatórios',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-07-15',
          tarefa: 'Relatórios Automatizados',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 20,
          dataInicio: '2024-05-15',
          previsaoEntrega: '2024-06-10',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 70,
          qtdHoras: 140,
          horasUtilizadas: 100,
          diferencaHoras: -40,
          observacoes: 'Relatórios agendados automaticamente',
          nome: 'Relatórios Automatizados',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT020',
          codigoProjeto: 'PRJ004 - Sistema de BI e Relatórios',
          projeto: 'Sistema de BI e Relatórios',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-07-15',
          tarefa: 'Treinamento Usuários',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 8,
          dataInicio: '2024-06-15',
          previsaoEntrega: '2024-06-25',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 40,
          qtdHoras: 56,
          horasUtilizadas: 25,
          diferencaHoras: -31,
          observacoes: 'Capacitação dos usuários finais',
          nome: 'Treinamento Usuários',
          responsavel: 'Maria Santos'
        },

        // PRJ005 - Plataforma E-learning (Ana Costa, Pedro Almeida)
        {
          codigo: 'AT021',
          codigoProjeto: 'PRJ005 - Plataforma E-learning',
          projeto: 'Plataforma E-learning',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-04-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Análise Pedagógica',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 22,
          dataInicio: '2024-04-01',
          previsaoEntrega: '2024-04-30',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 154,
          horasUtilizadas: 150,
          diferencaHoras: -4,
          observacoes: 'Metodologias de ensino definidas',
          nome: 'Análise Pedagógica',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT022',
          codigoProjeto: 'PRJ005 - Plataforma E-learning',
          projeto: 'Plataforma E-learning',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-04-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Plataforma Base',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 45,
          dataInicio: '2024-05-01',
          previsaoEntrega: '2024-06-20',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 35,
          qtdHoras: 315,
          horasUtilizadas: 110,
          diferencaHoras: -205,
          observacoes: 'LMS customizado em desenvolvimento',
          nome: 'Plataforma Base',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT023',
          codigoProjeto: 'PRJ005 - Plataforma E-learning',
          projeto: 'Plataforma E-learning',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-04-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Criação de Conteúdo',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 60,
          dataInicio: '2024-06-01',
          previsaoEntrega: '2024-08-15',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 25,
          qtdHoras: 420,
          horasUtilizadas: 105,
          diferencaHoras: -315,
          observacoes: 'Módulos de treinamento corporativo',
          nome: 'Criação de Conteúdo',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT024',
          codigoProjeto: 'PRJ005 - Plataforma E-learning',
          projeto: 'Plataforma E-learning',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-04-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Sistema de Avaliação',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 25,
          dataInicio: '2024-08-01',
          previsaoEntrega: '2024-09-01',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 15,
          qtdHoras: 175,
          horasUtilizadas: 25,
          diferencaHoras: -150,
          observacoes: 'Quizzes e provas online',
          nome: 'Sistema de Avaliação',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT025',
          codigoProjeto: 'PRJ005 - Plataforma E-learning',
          projeto: 'Plataforma E-learning',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-04-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Certificação Digital',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 15,
          dataInicio: '2024-10-01',
          previsaoEntrega: '2024-10-20',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 5,
          qtdHoras: 105,
          horasUtilizadas: 5,
          diferencaHoras: -100,
          observacoes: 'Certificados blockchain',
          nome: 'Certificação Digital',
          responsavel: 'Ana Costa'
        },

        // PRJ006 - Sistema de Estoque (João Silva, Ana Costa)
        {
          codigo: 'AT026',
          codigoProjeto: 'PRJ006 - Sistema de Estoque',
          projeto: 'Sistema de Estoque',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-02-15',
          fimPlaneado: '2024-08-15',
          tarefa: 'Análise de Processos',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 18,
          dataInicio: '2024-02-15',
          previsaoEntrega: '2024-03-08',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 126,
          horasUtilizadas: 120,
          diferencaHoras: -6,
          observacoes: 'Mapeamento completo dos processos',
          nome: 'Análise de Processos',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT027',
          codigoProjeto: 'PRJ006 - Sistema de Estoque',
          projeto: 'Sistema de Estoque',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-02-15',
          fimPlaneado: '2024-08-15',
          tarefa: 'Interface de Gestão',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 28,
          dataInicio: '2024-03-15',
          previsaoEntrega: '2024-04-15',
          status: 'Concluída',
          statusPrazo: 'Fora do Prazo',
          progresso: 100,
          qtdHoras: 196,
          horasUtilizadas: 210,
          diferencaHoras: 14,
          observacoes: 'Dashboard de controle de estoque',
          nome: 'Interface de Gestão',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT028',
          codigoProjeto: 'PRJ006 - Sistema de Estoque',
          projeto: 'Sistema de Estoque',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-02-15',
          fimPlaneado: '2024-08-15',
          tarefa: 'Integração ERP',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 35,
          dataInicio: '2024-04-20',
          previsaoEntrega: '2024-06-01',
          status: 'Em Andamento',
          statusPrazo: 'Fora do Prazo',
          progresso: 75,
          qtdHoras: 245,
          horasUtilizadas: 200,
          diferencaHoras: -45,
          observacoes: 'Conectando com SAP existente',
          nome: 'Integração ERP',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT029',
          codigoProjeto: 'PRJ006 - Sistema de Estoque',
          projeto: 'Sistema de Estoque',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-02-15',
          fimPlaneado: '2024-08-15',
          tarefa: 'Código de Barras',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 20,
          dataInicio: '2024-05-01',
          previsaoEntrega: '2024-05-25',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 60,
          qtdHoras: 140,
          horasUtilizadas: 85,
          diferencaHoras: -55,
          observacoes: 'Sistema de leitura automática',
          nome: 'Código de Barras',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT030',
          codigoProjeto: 'PRJ006 - Sistema de Estoque',
          projeto: 'Sistema de Estoque',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-02-15',
          fimPlaneado: '2024-08-15',
          tarefa: 'Relatórios Gerenciais',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 12,
          dataInicio: '2024-06-15',
          previsaoEntrega: '2024-07-01',
          status: 'Cancelada',
          statusPrazo: 'Dentro do Prazo',
          progresso: 0,
          qtdHoras: 84,
          horasUtilizadas: 0,
          diferencaHoras: -84,
          observacoes: 'Integrado ao sistema de BI',
          nome: 'Relatórios Gerenciais',
          responsavel: 'João Silva'
        },

        // PRJ007 - Portal de Fornecedores (Carlos Oliveira, Maria Santos)
        {
          codigo: 'AT031',
          codigoProjeto: 'PRJ007 - Portal de Fornecedores',
          projeto: 'Portal de Fornecedores',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-05-01',
          fimPlaneado: '2024-11-30',
          tarefa: 'Levantamento de Requisitos',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 20,
          dataInicio: '2024-05-01',
          previsaoEntrega: '2024-05-25',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 140,
          horasUtilizadas: 135,
          diferencaHoras: -5,
          observacoes: 'Necessidades dos fornecedores mapeadas',
          nome: 'Levantamento de Requisitos',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT032',
          codigoProjeto: 'PRJ007 - Portal de Fornecedores',
          projeto: 'Portal de Fornecedores',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-05-01',
          fimPlaneado: '2024-11-30',
          tarefa: 'Design do Portal',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 25,
          dataInicio: '2024-06-01',
          previsaoEntrega: '2024-07-01',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 40,
          qtdHoras: 175,
          horasUtilizadas: 70,
          diferencaHoras: -105,
          observacoes: 'Interface intuitiva para fornecedores',
          nome: 'Design do Portal',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT033',
          codigoProjeto: 'PRJ007 - Portal de Fornecedores',
          projeto: 'Portal de Fornecedores',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-05-01',
          fimPlaneado: '2024-11-30',
          tarefa: 'Sistema de Cotações',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 30,
          dataInicio: '2024-07-15',
          previsaoEntrega: '2024-08-20',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 25,
          qtdHoras: 210,
          horasUtilizadas: 50,
          diferencaHoras: -160,
          observacoes: 'Processo automatizado de cotações',
          nome: 'Sistema de Cotações',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT034',
          codigoProjeto: 'PRJ007 - Portal de Fornecedores',
          projeto: 'Portal de Fornecedores',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-05-01',
          fimPlaneado: '2024-11-30',
          tarefa: 'Gestão de Contratos',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 22,
          dataInicio: '2024-08-01',
          previsaoEntrega: '2024-08-30',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 15,
          qtdHoras: 154,
          horasUtilizadas: 25,
          diferencaHoras: -129,
          observacoes: 'Assinatura digital de contratos',
          nome: 'Gestão de Contratos',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT035',
          codigoProjeto: 'PRJ007 - Portal de Fornecedores',
          projeto: 'Portal de Fornecedores',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-05-01',
          fimPlaneado: '2024-11-30',
          tarefa: 'Avaliação de Performance',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 18,
          dataInicio: '2024-09-15',
          previsaoEntrega: '2024-10-08',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 5,
          qtdHoras: 126,
          horasUtilizadas: 8,
          diferencaHoras: -118,
          observacoes: 'KPIs de fornecedores',
          nome: 'Avaliação de Performance',
          responsavel: 'Carlos Oliveira'
        },

        // PRJ008 - Sistema de RH Digital (Pedro Almeida, Maria Santos)
        {
          codigo: 'AT036',
          codigoProjeto: 'PRJ008 - Sistema de RH Digital',
          projeto: 'Sistema de RH Digital',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-03-15',
          fimPlaneado: '2024-10-15',
          tarefa: 'Análise de Processos RH',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 25,
          dataInicio: '2024-03-15',
          previsaoEntrega: '2024-04-15',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 175,
          horasUtilizadas: 170,
          diferencaHoras: -5,
          observacoes: 'Mapeamento completo dos processos de RH',
          nome: 'Análise de Processos RH',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT037',
          codigoProjeto: 'PRJ008 - Sistema de RH Digital',
          projeto: 'Sistema de RH Digital',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-03-15',
          fimPlaneado: '2024-10-15',
          tarefa: 'Portal do Colaborador',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 35,
          dataInicio: '2024-04-20',
          previsaoEntrega: '2024-06-01',
          status: 'Em Andamento',
          statusPrazo: 'Fora do Prazo',
          progresso: 70,
          qtdHoras: 245,
          horasUtilizadas: 180,
          diferencaHoras: -65,
          observacoes: 'Self-service para colaboradores',
          nome: 'Portal do Colaborador',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT038',
          codigoProjeto: 'PRJ008 - Sistema de RH Digital',
          projeto: 'Sistema de RH Digital',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-03-15',
          fimPlaneado: '2024-10-15',
          tarefa: 'Sistema de Recrutamento',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 28,
          dataInicio: '2024-05-15',
          previsaoEntrega: '2024-06-20',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 55,
          qtdHoras: 196,
          horasUtilizadas: 110,
          diferencaHoras: -86,
          observacoes: 'ATS integrado com LinkedIn',
          nome: 'Sistema de Recrutamento',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT039',
          codigoProjeto: 'PRJ008 - Sistema de RH Digital',
          projeto: 'Sistema de RH Digital',
          responsavelProjeto: 'Maria Santos',
          inicioPlaneado: '2024-03-15',
          fimPlaneado: '2024-10-15',
          tarefa: 'Gestão de Performance',
          responsaveisTarefa: 'Maria Santos',
          diasPrevistos: 20,
          dataInicio: '2024-07-01',
          previsaoEntrega: '2024-07-25',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 30,
          qtdHoras: 140,
          horasUtilizadas: 45,
          diferencaHoras: -95,
          observacoes: 'Avaliações 360 graus',
          nome: 'Gestão de Performance',
          responsavel: 'Maria Santos'
        },
        {
          codigo: 'AT040',
          codigoProjeto: 'PRJ008 - Sistema de RH Digital',
          projeto: 'Sistema de RH Digital',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-03-15',
          fimPlaneado: '2024-10-15',
          tarefa: 'Analytics de RH',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 15,
          dataInicio: '2024-08-15',
          previsaoEntrega: '2024-09-01',
          status: 'Cancelada',
          statusPrazo: 'Dentro do Prazo',
          progresso: 0,
          qtdHoras: 105,
          horasUtilizadas: 0,
          diferencaHoras: -105,
          observacoes: 'Integrado ao sistema de BI',
          nome: 'Analytics de RH',
          responsavel: 'Pedro Almeida'
        },

        // PRJ009 - API Gateway Corporativo (Ana Costa, João Silva)
        {
          codigo: 'AT041',
          codigoProjeto: 'PRJ009 - API Gateway Corporativo',
          projeto: 'API Gateway Corporativo',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-06-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Arquitetura de APIs',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 20,
          dataInicio: '2024-06-01',
          previsaoEntrega: '2024-06-25',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 140,
          horasUtilizadas: 135,
          diferencaHoras: -5,
          observacoes: 'Padrões REST e GraphQL definidos',
          nome: 'Arquitetura de APIs',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT042',
          codigoProjeto: 'PRJ009 - API Gateway Corporativo',
          projeto: 'API Gateway Corporativo',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-06-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Implementação Gateway',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 40,
          dataInicio: '2024-07-01',
          previsaoEntrega: '2024-08-15',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 35,
          qtdHoras: 280,
          horasUtilizadas: 100,
          diferencaHoras: -180,
          observacoes: 'Kong API Gateway configurado',
          nome: 'Implementação Gateway',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT043',
          codigoProjeto: 'PRJ009 - API Gateway Corporativo',
          projeto: 'API Gateway Corporativo',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-06-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Autenticação e Autorização',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 25,
          dataInicio: '2024-08-01',
          previsaoEntrega: '2024-09-01',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 20,
          qtdHoras: 175,
          horasUtilizadas: 35,
          diferencaHoras: -140,
          observacoes: 'OAuth 2.0 e JWT implementados',
          nome: 'Autenticação e Autorização',
          responsavel: 'Ana Costa'
        },
        {
          codigo: 'AT044',
          codigoProjeto: 'PRJ009 - API Gateway Corporativo',
          projeto: 'API Gateway Corporativo',
          responsavelProjeto: 'João Silva',
          inicioPlaneado: '2024-06-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Monitoramento e Logs',
          responsaveisTarefa: 'João Silva',
          diasPrevistos: 18,
          dataInicio: '2024-09-15',
          previsaoEntrega: '2024-10-08',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 10,
          qtdHoras: 126,
          horasUtilizadas: 15,
          diferencaHoras: -111,
          observacoes: 'ELK Stack para observabilidade',
          nome: 'Monitoramento e Logs',
          responsavel: 'João Silva'
        },
        {
          codigo: 'AT045',
          codigoProjeto: 'PRJ009 - API Gateway Corporativo',
          projeto: 'API Gateway Corporativo',
          responsavelProjeto: 'Ana Costa',
          inicioPlaneado: '2024-06-01',
          fimPlaneado: '2024-12-31',
          tarefa: 'Documentação APIs',
          responsaveisTarefa: 'Ana Costa',
          diasPrevistos: 12,
          dataInicio: '2024-10-15',
          previsaoEntrega: '2024-11-01',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 5,
          qtdHoras: 84,
          horasUtilizadas: 5,
          diferencaHoras: -79,
          observacoes: 'Swagger/OpenAPI 3.0',
          nome: 'Documentação APIs',
          responsavel: 'Ana Costa'
        },

        // PRJ010 - Sistema de Segurança Digital (Carlos Oliveira, Pedro Almeida)
        {
          codigo: 'AT046',
          codigoProjeto: 'PRJ010 - Sistema de Segurança Digital',
          projeto: 'Sistema de Segurança Digital',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-05-31',
          tarefa: 'Auditoria de Segurança',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 20,
          dataInicio: '2024-01-01',
          previsaoEntrega: '2024-01-25',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 140,
          horasUtilizadas: 135,
          diferencaHoras: -5,
          observacoes: 'Vulnerabilidades identificadas e catalogadas',
          nome: 'Auditoria de Segurança',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT047',
          codigoProjeto: 'PRJ010 - Sistema de Segurança Digital',
          projeto: 'Sistema de Segurança Digital',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-05-31',
          tarefa: 'Firewall Avançado',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 25,
          dataInicio: '2024-02-01',
          previsaoEntrega: '2024-03-01',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 175,
          horasUtilizadas: 170,
          diferencaHoras: -5,
          observacoes: 'Palo Alto Networks implementado',
          nome: 'Firewall Avançado',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT048',
          codigoProjeto: 'PRJ010 - Sistema de Segurança Digital',
          projeto: 'Sistema de Segurança Digital',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-05-31',
          tarefa: 'SIEM Implementation',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 30,
          dataInicio: '2024-03-01',
          previsaoEntrega: '2024-04-05',
          status: 'Concluída',
          statusPrazo: 'Dentro do Prazo',
          progresso: 100,
          qtdHoras: 210,
          horasUtilizadas: 205,
          diferencaHoras: -5,
          observacoes: 'Splunk SIEM configurado e operacional',
          nome: 'SIEM Implementation',
          responsavel: 'Carlos Oliveira'
        },
        {
          codigo: 'AT049',
          codigoProjeto: 'PRJ010 - Sistema de Segurança Digital',
          projeto: 'Sistema de Segurança Digital',
          responsavelProjeto: 'Pedro Almeida',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-05-31',
          tarefa: 'Endpoint Protection',
          responsaveisTarefa: 'Pedro Almeida',
          diasPrevistos: 18,
          dataInicio: '2024-04-01',
          previsaoEntrega: '2024-04-25',
          status: 'Em Andamento',
          statusPrazo: 'Fora do Prazo',
          progresso: 85,
          qtdHoras: 126,
          horasUtilizadas: 110,
          diferencaHoras: -16,
          observacoes: 'CrowdStrike Falcon em rollout',
          nome: 'Endpoint Protection',
          responsavel: 'Pedro Almeida'
        },
        {
          codigo: 'AT050',
          codigoProjeto: 'PRJ010 - Sistema de Segurança Digital',
          projeto: 'Sistema de Segurança Digital',
          responsavelProjeto: 'Carlos Oliveira',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-05-31',
          tarefa: 'Treinamento Segurança',
          responsaveisTarefa: 'Carlos Oliveira',
          diasPrevistos: 10,
          dataInicio: '2024-05-01',
          previsaoEntrega: '2024-05-15',
          status: 'Em Andamento',
          statusPrazo: 'Dentro do Prazo',
          progresso: 60,
          qtdHoras: 70,
          horasUtilizadas: 45,
          diferencaHoras: -25,
          observacoes: 'Conscientização em cybersegurança',
          nome: 'Treinamento Segurança',
          responsavel: 'Carlos Oliveira'
        }
      ]

      // Salvar dados na API
      console.log('💾 Salvando dados de exemplo na API...')
      console.log('👥 Salvando', pessoasExemplo.length, 'pessoas...')
      
      // Salvar pessoas
      for (const pessoa of pessoasExemplo) {
        console.log('💾 Salvando pessoa:', pessoa.nome);
        await pessoasAPI.create(pessoa)
      }
      
      console.log('📋 Salvando', projetosExemplo.length, 'projetos...')
      // Salvar projetos
      for (const projeto of projetosExemplo) {
        console.log('💾 Salvando projeto:', projeto.nome);
        await projetosAPI.create(projeto)
      }
      
      console.log('📝 Salvando', atividadesExemplo.length, 'atividades...')
      // Salvar atividades
      for (const atividade of atividadesExemplo) {
        console.log('💾 Salvando atividade:', atividade.nome);
        await atividadesAPI.create(atividade)
      }

      // Recarregar dados da API
      await carregarDados()
      
      console.log('✅ DADOS DE EXEMPLO SALVOS NA API E CARREGADOS COMPLETAMENTE');
    } catch (error) {
      console.error('❌ Erro ao salvar dados de exemplo na API:', error)
      
      // Fallback: carregar dados localmente se a API falhar
      setPessoas([
        {
          id: 1,
          codigo: 'PES001',
          nome: 'João Silva',
          email: 'joao.silva@empresa.com',
          cargo: 'Analista de Sistemas',
          departamento: 'TI',
          status: 'Ativo'
        },
        {
          id: 2,
          codigo: 'PES002',
          nome: 'Maria Santos',
          email: 'maria.santos@empresa.com',
          cargo: 'Designer UX/UI',
          departamento: 'Design',
          status: 'Ativo'
        }
      ])

      setProjetos([
        {
          id: 1,
          codigo: 'PRJ001',
          nome: 'Sistema de Gestão',
          responsaveis: 'João Silva, Maria Santos',
          inicioPlaneado: '2024-01-01',
          fimPlaneado: '2024-06-30',
          status: 'Em Andamento',
          progresso: 65
        }
      ])

      setAtividades([
        {
          id: 1,
          codigo: 'AT001',
          nome: 'Análise de Requisitos',
          projeto: 'Sistema de Gestão',
          codigoProjeto: 'PRJ001 - Sistema de Gestão',
          responsavel: 'João Silva',
          status: 'Em Andamento',
          inicioPlaneado: '2024-01-15',
          fimPlaneado: '2024-01-30',
          progresso: 75
        },
        {
          id: 2,
          codigo: 'AT002',
          nome: 'Design da Interface',
          projeto: 'Sistema de Gestão',
          codigoProjeto: 'PRJ001 - Sistema de Gestão',
          responsavel: 'Maria Santos',
          status: 'Concluída',
          inicioPlaneado: '2024-02-01',
          fimPlaneado: '2024-02-15',
          progresso: 100
        }
      ])
      
      console.log('✅ Dados de exemplo carregados localmente como fallback')
    }
  }

  // Funções de persistência de dados
  // Função para salvar dados com validação (chamada apenas pelo botão Salvar)
  const salvarDadosComValidacao = () => {
    // Validar todos os projetos e destacar campos obrigatórios vazios
    let novosErros = {}
    let temErros = false
    let camposComErroDetalhes = []
    
    projetos.forEach(projeto => {
      const camposObrigatorios = [
        { campo: 'codigo', nome: 'Código' },
        { campo: 'nome', nome: 'Nome' },
        { campo: 'descricao', nome: 'Descrição' },
        { campo: 'prioridade', nome: 'Prioridade' },
        { campo: 'responsaveis', nome: 'Responsáveis' },
        { campo: 'inicioPlaneado', nome: 'Início Planejado' },
        { campo: 'fimPlaneado', nome: 'Fim Planejado' }
      ]
      
      console.log('🔍 Validando projeto:', projeto.nome, projeto)
      
      camposObrigatorios.forEach(item => {
        const valor = projeto[item.campo]
        let campoVazio = false
        
        if (item.campo === 'responsaveis') {
          // Para responsáveis, pode ser string ou array
          if (typeof valor === 'string') {
            campoVazio = !valor || valor.trim() === ''
          } else if (Array.isArray(valor)) {
            campoVazio = valor.length === 0
          } else {
            campoVazio = !valor
          }
          console.log(`📋 Campo ${item.campo}:`, {
            valor,
            tipo: typeof valor,
            isArray: Array.isArray(valor),
            campoVazio,
            valorTrimmed: typeof valor === 'string' ? valor.trim() : 'N/A'
          })
        } else {
          // Para outros campos, verificar se está vazio ou só tem espaços
          campoVazio = !valor || valor.toString().trim() === ''
          console.log(`📋 Campo ${item.campo}:`, valor, 'Vazio?', campoVazio)
        }
        
        if (campoVazio) {
          const chaveErro = `${projeto.id}_${item.campo}`
          novosErros[chaveErro] = true
          temErros = true
          camposComErroDetalhes.push(item.nome)
        }
      })
    })
    
    // Atualizar estado dos campos com erro
    setCamposComErro(novosErros)
    
    if (temErros) {
      // Mostrar modal com detalhes dos campos que faltam
      setErrorDetails(camposComErroDetalhes)
      setShowErrorModal(true)
      mostrarNotificacao('⚠️ Existem campos obrigatórios em branco! Verifique os detalhes na tela.')
      return
    }
    
    // Se não há erros, limpar destaques e mostrar mensagem de sucesso
    setCamposComErro({})
    setShowSaveMessage(true)
    setTimeout(() => {
      setShowSaveMessage(false)
    }, 3000) // Mensagem desaparece após 3 segundos
  }



  // Função para salvar dados sem validação (para uso interno)
  const salvarDados = async () => {
    try {
      console.log('💾 Iniciando salvamento de todos os dados...')
      
      let sucessos = 0
      let erros = 0

      // Salvar todos os projetos
      for (const projeto of projetos) {
        try {
          if (projeto.id && projeto.id > 0) {
            await projetosAPI.update(projeto.id, projeto)
          } else {
            await projetosAPI.create(projeto)
          }
          sucessos++
        } catch (error) {
          console.error(`Erro ao salvar projeto ${projeto.nome}:`, error)
          erros++
        }
      }

      // Salvar todas as atividades
      for (const atividade of atividades) {
        try {
          if (atividade.id && atividade.id > 0) {
            await atividadesAPI.update(atividade.id, atividade)
          } else {
            await atividadesAPI.create(atividade)
          }
          sucessos++
        } catch (error) {
          console.error(`Erro ao salvar atividade ${atividade.nome}:`, error)
          erros++
        }
      }

      // Salvar todas as pessoas
      for (const pessoa of pessoas) {
        try {
          const pessoaParaAPI = {
            ...pessoa,
            nome: pessoa.nomeCompleto || pessoa.nome
          }
          if (pessoa.id && pessoa.id > 0) {
            await pessoasAPI.update(pessoa.id, pessoaParaAPI)
          } else {
            await pessoasAPI.create(pessoaParaAPI)
          }
          sucessos++
        } catch (error) {
          console.error(`Erro ao salvar pessoa ${pessoa.nomeCompleto || pessoa.nome}:`, error)
          erros++
        }
      }

      // Salvar todas as subtarefas
      for (const subtarefa of subtarefas) {
        try {
          if (subtarefa.id && subtarefa.id > 0) {
            await subtarefasAPI.update(subtarefa.id, subtarefa)
          } else {
            await subtarefasAPI.create(subtarefa)
          }
          sucessos++
        } catch (error) {
          console.error(`Erro ao salvar subtarefa ${subtarefa.nome}:`, error)
          erros++
        }
      }

      // Limpar alterações pendentes após salvamento bem-sucedido
      setAlteracoesPendentes({
        projetos: new Set(),
        atividades: new Set(),
        pessoas: new Set()
      })

      // Mostrar resultado
      if (erros === 0) {
        showModal(
          'Salvamento Concluído!',
          `Todos os dados foram salvos com sucesso! (${sucessos} itens)`,
          'success'
        )
        console.log(`✅ Salvamento concluído: ${sucessos} itens salvos`)
      } else {
        showModal(
          'Salvamento Parcial',
          `${sucessos} itens salvos com sucesso, ${erros} falharam. Verifique o console para detalhes.`,
          'warning'
        )
        console.log(`⚠️ Salvamento parcial: ${sucessos} sucessos, ${erros} erros`)
      }

    } catch (error) {
      console.error('❌ Erro geral ao salvar dados:', error)
      showModal(
        'Erro no Salvamento',
        'Erro ao salvar dados. Verifique sua conexão e tente novamente.',
        'error'
      )
    }
  }

  const carregarDados = async () => {
    try {
      console.log('🔄 Carregando dados da API...')
      
      // Testar conexão com a API
      const isConnected = await testConnection()
      if (!isConnected) {
        console.warn('⚠️ API não disponível, carregando dados de exemplo')
        conectarDadosExemplo()
        return
      }

      // Carregar dados de todas as tabelas
      const [projetosData, pessoasData, atividadesData, subtarefasData] = await Promise.all([
        projetosAPI.getAll().catch(() => []),
        pessoasAPI.getAll().catch(() => []),
        atividadesAPI.getAll().catch(() => []),
        subtarefasAPI.getAll().catch(() => [])
      ])

      // Carregar todos os projetos sem filtrar
      console.log('📊 Dados recebidos da API:', {
        projetos: projetosData.length,
        pessoas: pessoasData.length,
        atividades: atividadesData.length,
        subtarefas: subtarefasData.length
      })
      
      // Mapear pessoas para incluir nomeCompleto se não existir
      const pessoasMapeadas = pessoasData.map(pessoa => ({
        ...pessoa,
        nomeCompleto: pessoa.nomeCompleto || pessoa.nome
      }))
      
      setProjetos(projetosData)
      setPessoas(pessoasMapeadas)
      setAtividades(atividadesData)
      setSubtarefas(subtarefasData)

      // Se não há dados no banco, carrega dados de exemplo
      if (projetosData.length === 0 && pessoasData.length === 0 && atividadesData.length === 0) {
        console.log('📊 Banco vazio, carregando dados de exemplo')
        conectarDadosExemplo()
      } else {
        console.log('✅ Dados carregados da API com sucesso')
        

      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da API:', error)
      conectarDadosExemplo() // Fallback para dados de exemplo
    }
  }

  const addProjeto = async () => {
    try {
      console.log('🔄 Iniciando criação de novo projeto...')
      
      // Encontra o próximo número sequencial disponível
      const existingNumbers = projetos
        .map(p => p.codigo)
        .filter(codigo => codigo && codigo.startsWith('PRJ'))
        .map(codigo => parseInt(codigo.replace('PRJ', '')) || 0)
        .filter(num => !isNaN(num))
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
      
      const novoProjeto = {
        codigo: `PRJ${String(nextNumber).padStart(2, '0')}`,
        nome: 'Novo Projeto',
        descricao: '',
        prioridade: '',
        responsaveis: '',
        inicioPlaneado: '',
        fimPlaneado: '',
        status: 'Ativo',
        progresso: 0,
        observacoes: ''
      }
      
      console.log('📝 Dados do novo projeto:', novoProjeto)
      
      // Salvar na API
      const projetoCriado = await projetosAPI.create(novoProjeto)
      console.log('💾 Projeto salvo na API:', projetoCriado)
      
      // Atualizar estado local
      setProjetos(prevProjetos => [...prevProjetos, projetoCriado])
      
      mostrarNotificacao('✅ Projeto criado com sucesso! Preencha os campos obrigatórios marcados com (*)')
      console.log('✅ Projeto criado com sucesso e adicionado ao estado')
    } catch (error) {
      console.error('❌ Erro detalhado ao criar projeto:', error)
      
      // Mesmo com erro na API, adicionar projeto localmente para não travar a interface
      const existingNumbers = projetos
        .map(p => p.codigo)
        .filter(codigo => codigo && codigo.startsWith('PRJ'))
        .map(codigo => parseInt(codigo.replace('PRJ', '')) || 0)
        .filter(num => !isNaN(num))
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
      
      const projetoLocal = {
        id: Date.now(), // ID temporário
        codigo: `PRJ${String(nextNumber).padStart(2, '0')}`,
        nome: 'Novo Projeto',
        descricao: '',
        prioridade: '',
        responsaveis: '',
        inicioPlaneado: '',
        fimPlaneado: '',
        status: 'Ativo',
        progresso: 0,
        observacoes: ''
      }
      
      setProjetos(prevProjetos => [...prevProjetos, projetoLocal])
      mostrarNotificacao('⚠️ Projeto criado localmente. Erro na API: ' + (error.message || 'Erro desconhecido'))
      console.log('⚠️ Projeto criado localmente devido a erro na API')
    }
  }

  const addSubtarefa = async () => {
    try {
      console.log('🔄 Iniciando criação de nova subtarefa...')
      
      // Encontra o próximo número sequencial disponível
      const existingNumbers = subtarefas
        .map(s => s.codigo)
        .filter(codigo => codigo && codigo.startsWith('SUB'))
        .map(codigo => parseInt(codigo.replace('SUB', '')) || 0)
        .filter(num => !isNaN(num))
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
      
      const novaSubtarefa = {
        codigo: `SUB${String(nextNumber).padStart(3, '0')}`,
        nome: 'Nova Subtarefa',
        atividadeId: atividades.length > 0 ? atividades[0].id : null,
        responsavel: '',
        dataInicio: '',
        dataFim: '',
        status: 'Pendente',
        progresso: 0,
        observacoes: ''
      }
      
      console.log('📝 Dados da nova subtarefa:', novaSubtarefa)
      
      // Salvar na API
      const subtarefaCriada = await subtarefasAPI.create(novaSubtarefa)
      console.log('💾 Subtarefa salva na API:', subtarefaCriada)
      
      // Atualizar estado local
      setSubtarefas(prevSubtarefas => [...prevSubtarefas, subtarefaCriada])
      
      mostrarNotificacao('✅ Subtarefa criada com sucesso! Preencha os campos obrigatórios.')
      console.log('✅ Subtarefa criada com sucesso e adicionada ao estado')
    } catch (error) {
      console.error('❌ Erro detalhado ao criar subtarefa:', error)
      
      // Mesmo com erro na API, adicionar subtarefa localmente para não travar a interface
      const existingNumbers = subtarefas
        .map(s => s.codigo)
        .filter(codigo => codigo && codigo.startsWith('SUB'))
        .map(codigo => parseInt(codigo.replace('SUB', '')) || 0)
        .filter(num => !isNaN(num))
      
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
      
      const subtarefaLocal = {
        id: Date.now(), // ID temporário
        codigo: `SUB${String(nextNumber).padStart(3, '0')}`,
        nome: 'Nova Subtarefa',
        atividadeId: atividades.length > 0 ? atividades[0].id : null,
        responsavel: '',
        dataInicio: '',
        dataFim: '',
        status: 'Pendente',
        progresso: 0,
        observacoes: ''
      }
      
      setSubtarefas(prevSubtarefas => [...prevSubtarefas, subtarefaLocal])
      mostrarNotificacao('⚠️ Subtarefa criada localmente. Erro na API: ' + (error.message || 'Erro desconhecido'))
      console.log('⚠️ Subtarefa criada localmente devido a erro na API')
    }
  }

  const updateSubtarefa = async (subtarefaId, campo, valor) => {
    try {
      console.log(`🔄 Atualizando subtarefa ${subtarefaId}, campo: ${campo}, valor:`, valor)
      
      // Encontrar a subtarefa atual
      const subtarefaAtual = subtarefas.find(s => s.id === subtarefaId)
      if (!subtarefaAtual) {
        console.error('❌ Subtarefa não encontrada:', subtarefaId)
        return
      }

      // Criar objeto com os dados atualizados
      const subtarefaAtualizada = {
        ...subtarefaAtual,
        [campo]: valor
      }

      console.log('📝 Dados da subtarefa atualizada:', subtarefaAtualizada)

      // Salvar na API
      const resultado = await subtarefasAPI.update(subtarefaId, subtarefaAtualizada)
      console.log('💾 Subtarefa atualizada na API:', resultado)

      // Atualizar estado local
      setSubtarefas(prevSubtarefas => 
        prevSubtarefas.map(s => 
          s.id === subtarefaId ? { ...s, [campo]: valor } : s
        )
      )

      console.log(`✅ Subtarefa ${subtarefaId} atualizada com sucesso`)
    } catch (error) {
      console.error('❌ Erro ao atualizar subtarefa:', error)
      
      // Mesmo com erro na API, atualizar localmente para não travar a interface
      setSubtarefas(prevSubtarefas => 
        prevSubtarefas.map(s => 
          s.id === subtarefaId ? { ...s, [campo]: valor } : s
        )
      )
      
      mostrarNotificacao('⚠️ Subtarefa atualizada localmente. Erro na API: ' + (error.message || 'Erro desconhecido'))
      console.log('⚠️ Subtarefa atualizada localmente devido a erro na API')
    }
  }

  const createBulkTasks = async () => {
    if (!selectedProjectForTasks || taskQuantity < 1) {
      alert('Por favor, selecione um projeto e uma quantidade válida de tarefas.')
      return
    }

    const selectedProject = projetos.find(p => p.id.toString() === selectedProjectForTasks)
    if (!selectedProject) {
      alert('Projeto não encontrado.')
      return
    }

    try {
      const newTasks = []
      for (let i = 1; i <= taskQuantity; i++) {
        const newTask = {
          codigo: `TAR${String(atividades.length + i).padStart(3, '0')}`,
          nome: `Nova Tarefa ${i}`,
          descricao: '',
          projeto: selectedProject.nome,
          responsavel: '',
          prioridade: 'Média',
          dataInicio: '',
          dataFim: '',
          status: 'Não Iniciado',
          progresso: 0,
          observacoes: ''
        }
        
        // Salvar na API
        const tarefaCriada = await atividadesAPI.create(newTask)
        newTasks.push(tarefaCriada)
      }

      // Atualizar estado local
      setAtividades([...atividades, ...newTasks])
      
      // Atualizar contador de tarefas do projeto
      await updateProjeto(selectedProject.id, 'totalTarefas', selectedProject.totalTarefas + taskQuantity)
      
      // Fechar modal e resetar valores
      setShowBulkTaskModal(false)
      setSelectedProjectForTasks('')
      setTaskQuantity(1)
      
      alert(`${taskQuantity} tarefa(s) criada(s) com sucesso para o projeto "${selectedProject.nome}"!`)
      console.log('✅ Tarefas criadas em lote com sucesso:', newTasks)
    } catch (error) {
      console.error('❌ Erro ao criar tarefas em lote:', error)
      alert('Erro ao criar tarefas. Tente novamente.')
    }
  }

  const createBulkActivities = async () => {
    if (!selectedProjectForActivity || activityQuantity < 1) {
      alert('Por favor, selecione um projeto e uma quantidade válida de atividades.')
      return
    }

    const selectedProject = projetos.find(p => p.codigo === selectedProjectForActivity)
    if (!selectedProject) {
      alert('Projeto não encontrado.')
      return
    }

    try {
      // Separar responsáveis do projeto (se houver múltiplos)
      const responsaveisArray = selectedProject.responsaveis 
        ? selectedProject.responsaveis.split(', ').filter(r => r.trim()) 
        : ['Não definido']

      const newActivities = []

      // Para cada atividade solicitada (apenas o número especificado)
      for (let i = 1; i <= activityQuantity; i++) {
        const newActivity = {
          // CÓDIGO PROJETO --> Informar o projeto que vai está na aba projeto concatenar codigo e nome do projeto
          codigoProjeto: `${selectedProject.codigo} - ${selectedProject.nome}`,
          // PROJETO (AUTO) carrega de forma automatica da aba projeto
          projeto: selectedProject.nome,
          // RESPONSÁVEL PROJETO (AUTO) carrega de forma automatica da aba projeto - todos os responsáveis
          responsavelProjeto: selectedProject.responsaveis || 'Não definido',
          // INÍCIO PLANEJADO (AUTO) carrega de forma automatica da aba projeto
          inicioPlaneado: selectedProject.inicioPlaneado || '',
          // FIM PLANEJADO (AUTO) carrega de forma automatica da aba projeto
          fimPlaneado: selectedProject.fimPlaneado || '',
          // TAREFA --> Preenche manualmente
          tarefa: `Nova Atividade ${i}`,
          // RESPONSÁVEIS TAREFA --> Preenche manualmente
          responsaveisTarefa: '',
          // DIAS PREVISTOS -- Informar a quantidade de dias
          diasPrevistos: 5, // Valor padrão
          // DATA INÍCIO --> Preenche manualmente
          dataInicio: '',
          // PREVISÃO ENTREGA (AUTO) --> Buscar os dias (DIAS PREVISTOS) + DATA INÍCIO
          previsaoEntrega: '', // Será calculado quando dataInicio for preenchida
          // STATUS (AUTO) --> Busca do campo progresso %
          status: 'Não Iniciado', // Baseado no progresso
          // STATUS PRAZO (AUTO)
          statusPrazo: 'Dentro do Prazo', // Será calculado
          // PROGRESSO %
          progresso: 0,
          // QTD HORAS (AUTO) = BUSCA DIAS PREVISTO * 7h diario
          qtdHoras: 5 * 7, // diasPrevistos * 7
          // HORAS UTILIZADAS --> Manual
          horasUtilizadas: 0,
          // DIFERENÇA HORAS (AUTO) --> HORAS UTILIZADAS - QTD HORAS (AUTO)
          diferencaHoras: 0 - (5 * 7), // horasUtilizadas - qtdHoras
          // OBSERVAÇÕES
          observacoes: '',
          // Campos adicionais para compatibilidade
          codigo: `AT${String(atividades.length + i).padStart(3, '0')}`,
          nome: `Nova Atividade ${i}`,
          responsavel: ''
        }
        
        // Salvar na API
        const atividadeCriada = await atividadesAPI.create(newActivity)
        newActivities.push(atividadeCriada)
      }

      // Atualizar estado local
      setAtividades([...atividades, ...newActivities])
      
      // Fechar modal e resetar valores
      setShowActivityModal(false)
      setSelectedProjectForActivity('')
      setActivityQuantity(1)
      
      const totalAtividades = newActivities.length
      const responsaveisCount = responsaveisArray.length
      
      if (responsaveisCount > 1) {
        mostrarNotificacao(`✅ ${totalAtividades} atividade(s) criada(s) com sucesso para o projeto "${selectedProject.nome}"! (Responsáveis do projeto: ${responsaveisArray.join(', ')})`)
      } else {
        mostrarNotificacao(`✅ ${totalAtividades} atividade(s) criada(s) com sucesso para o projeto "${selectedProject.nome}"!`)
      }
      
      console.log('✅ Atividades criadas em lote com sucesso:', newActivities)
    } catch (error) {
      console.error('❌ Erro ao criar atividades em lote:', error)
      mostrarNotificacao('❌ Erro ao criar atividades. Tente novamente.')
    }
  }

  // Função para calcular previsão de entrega
  const calculatePrevisaoEntrega = (dataInicio, diasPrevistos) => {
    if (!dataInicio || !diasPrevistos) return ''
    
    const startDate = new Date(dataInicio)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + diasPrevistos)
    
    return endDate.toISOString().split('T')[0]
  }

  // Função para calcular status baseado no progresso
  const calculateStatus = (progresso) => {
    if (progresso === -1) return 'Cancelado'
    if (progresso === 0) return 'Não Iniciado'
    if (progresso > 0 && progresso <= 99) return 'Em Andamento'
    if (progresso === 100) return 'Concluído'
    return 'Não Iniciado'
  }

  // Função para calcular status do prazo
  const calculateStatusPrazo = (previsaoEntrega) => {
    if (!previsaoEntrega) return 'Dentro do Prazo'
    
    const today = new Date()
    const deliveryDate = new Date(previsaoEntrega)
    
    return deliveryDate >= today ? 'Dentro do Prazo' : 'Fora do Prazo'
  }

  // Funções para edição inline de atividades
  const startEditingActivity = (activityId) => {
    setEditingActivity(activityId)
  }

  const cancelEditingActivity = () => {
    setEditingActivity(null)
  }

  const saveActivityEdit = (activityId) => {
    setEditingActivity(null)
    // A atualização já foi feita através do updateAtividade
  }

  const addPessoa = async () => {
    try {
      const novaPessoa = {
        codigo: `PES${String(pessoas.length + 1).padStart(3, '0')}`,
        nome: 'Nova Pessoa',
        nomeCompleto: 'Nova Pessoa',
        email: '',
        cargo: '',
        departamento: '',
        status: 'Ativo'
      }
      
      // Salvar na API
      const pessoaCriada = await pessoasAPI.create(novaPessoa)
      
      // Atualizar estado local
      setPessoas([...pessoas, pessoaCriada])
      
      console.log('✅ Pessoa criada com sucesso:', pessoaCriada)
    } catch (error) {
      console.error('❌ Erro ao criar pessoa:', error)
      alert('Erro ao criar pessoa. Tente novamente.')
    }
  }

  // Estado para notificações do sistema
  const [notificacao, setNotificacao] = useState(null)

  // Função para mostrar notificação do sistema
  const mostrarNotificacao = (mensagem, tipo = 'warning') => {
    setNotificacao({ mensagem, tipo })
    setTimeout(() => setNotificacao(null), 5000) // Remove após 5 segundos
  }

  // Função para validar campos obrigatórios do projeto
  const validarCamposObrigatoriosProjeto = (projeto) => {
    const camposObrigatorios = [
      { campo: 'codigo', nome: 'Código' },
      { campo: 'nome', nome: 'Nome' },
      { campo: 'descricao', nome: 'Descrição' },
      { campo: 'prioridade', nome: 'Prioridade' },
      { campo: 'responsaveis', nome: 'Responsáveis' },
      { campo: 'inicioPlaneado', nome: 'Início Planejado' },
      { campo: 'fimPlaneado', nome: 'Fim Planejado' }
    ]
    
    const camposVazios = camposObrigatorios.filter(item => {
      const valor = projeto[item.campo]
      
      // Tratamento especial para responsáveis
      if (item.campo === 'responsaveis') {
        if (Array.isArray(valor)) {
          return valor.length === 0
        }
        return !valor || valor.toString().trim() === ''
      }
      
      return !valor || valor.toString().trim() === ''
    })
    
    if (camposVazios.length > 0) {
      const listaCampos = camposVazios.map(item => item.nome).join(', ')
      mostrarNotificacao(`⚠️ Campos obrigatórios não preenchidos: ${listaCampos}`)
      return false
    }
    
    return true
  }

  // Função para validar campos obrigatórios da atividade
  const validarCamposObrigatoriosAtividade = (atividade) => {
    const camposObrigatorios = [
      { campo: 'tarefa', nome: 'Tarefa' },
      { campo: 'responsaveisTarefa', nome: 'Resp. Tarefa' }
    ]
    
    const camposVazios = camposObrigatorios.filter(item => {
      const valor = atividade[item.campo]
      return !valor || valor.toString().trim() === ''
    })
    
    if (camposVazios.length > 0) {
      const listaCampos = camposVazios.map(item => item.nome).join(', ')
      mostrarNotificacao(`⚠️ Campos obrigatórios não preenchidos: ${listaCampos}`)
      return false
    }
    
    return true
  }

  const updateProjeto = async (id, field, value) => {
    try {
      console.log('🔄 updateProjeto chamado:', { id, field, value })
      
      // Atualizar estado local primeiro para responsividade
      const updatedProjetos = projetos.map(projeto => 
        projeto.id === id ? { ...projeto, [field]: value } : projeto
      )
      setProjetos(updatedProjetos)
      
      // Marcar como alteração pendente
      marcarAlteracaoPendente('projetos', id)
      console.log('📝 Projeto marcado como alteração pendente:', id)
    } catch (error) {
      console.error('❌ Erro ao atualizar projeto:', error)
      // Reverter mudança local em caso de erro
      await carregarDados()
    }
  }

  const updatePessoa = async (id, field, value) => {
    try {
      console.log('🔄 updatePessoa chamado:', { id, field, value })
      
      // Atualizar estado local primeiro para responsividade
      const updatedPessoas = pessoas.map(pessoa => {
        if (pessoa.id === id) {
          const updatedPessoa = { ...pessoa, [field]: value }
          // Sincronizar nome e nomeCompleto
          if (field === 'nomeCompleto') {
            updatedPessoa.nome = value
          } else if (field === 'nome') {
            updatedPessoa.nomeCompleto = value
          }
          return updatedPessoa
        }
        return pessoa
      })
      setPessoas(updatedPessoas)
      
      // Marcar como alteração pendente
      marcarAlteracaoPendente('pessoas', id)
      console.log('📝 Pessoa marcada como alteração pendente:', id)
    } catch (error) {
      console.error('❌ Erro ao atualizar pessoa:', error)
      // Reverter mudança local em caso de erro
      await carregarDados()
    }
  }

  const salvarPessoa = async (pessoa) => {
    try {
      // Mapear nomeCompleto para nome para a API
      const pessoaParaAPI = {
        ...pessoa,
        nome: pessoa.nomeCompleto || pessoa.nome
      }
      
      if (pessoa.id && pessoa.id > 0) {
        // Atualizar pessoa existente
        await pessoasAPI.update(pessoa.id, pessoaParaAPI)
        console.log('✅ Pessoa atualizada com sucesso:', pessoaParaAPI)
      } else {
        // Criar nova pessoa
        const pessoaCriada = await pessoasAPI.create(pessoaParaAPI)
        // Atualizar o estado local com a pessoa criada (com ID do banco)
        setPessoas(pessoas.map(p => p.id === pessoa.id ? pessoaCriada : p))
        console.log('✅ Pessoa criada com sucesso:', pessoaCriada)
      }
      alert('Pessoa salva com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao salvar pessoa:', error)
      alert('Erro ao salvar pessoa. Tente novamente.')
    }
  }

  // Funções para controle de alterações pendentes
  const marcarAlteracaoPendente = (tipo, id) => {
    console.log('🔄 marcarAlteracaoPendente chamado:', { tipo, id })
    setAlteracoesPendentes(prev => {
      const newState = {
        ...prev,
        [tipo]: new Set([...prev[tipo], id])
      }
      console.log('📝 Novo estado alteracoesPendentes:', newState)
      return newState
    })
  }

  const removerAlteracaoPendente = (tipo, id) => {
    setAlteracoesPendentes(prev => {
      const newSet = new Set(prev[tipo])
      newSet.delete(id)
      return {
        ...prev,
        [tipo]: newSet
      }
    })
  }

  const temAlteracoesPendentes = () => {
    return alteracoesPendentes.projetos.size > 0 || 
           alteracoesPendentes.atividades.size > 0 || 
           alteracoesPendentes.pessoas.size > 0
  }

  const salvarTodasAlteracoes = async () => {
    if (!temAlteracoesPendentes()) {
      alert('Não há alterações pendentes para salvar.')
      return
    }

    setSalvandoTudo(true)
    let sucessos = 0
    let erros = 0

    try {
      // Salvar projetos pendentes
      for (const projetoId of alteracoesPendentes.projetos) {
        try {
          const projeto = projetos.find(p => p.id === projetoId)
          if (projeto) {
            await projetosAPI.update(projetoId, projeto)
            sucessos++
            removerAlteracaoPendente('projetos', projetoId)
          }
        } catch (error) {
          console.error(`Erro ao salvar projeto ${projetoId}:`, error)
          erros++
        }
      }

      // Salvar atividades pendentes
      for (const atividadeId of alteracoesPendentes.atividades) {
        try {
          const atividade = atividades.find(a => a.id === atividadeId)
          if (atividade) {
            await atividadesAPI.update(atividadeId, atividade)
            sucessos++
            removerAlteracaoPendente('atividades', atividadeId)
          }
        } catch (error) {
          console.error(`Erro ao salvar atividade ${atividadeId}:`, error)
          erros++
        }
      }

      // Salvar pessoas pendentes
      for (const pessoaId of alteracoesPendentes.pessoas) {
        try {
          const pessoa = pessoas.find(p => p.id === pessoaId)
          if (pessoa) {
            const pessoaParaAPI = {
              ...pessoa,
              nome: pessoa.nomeCompleto || pessoa.nome
            }
            await pessoasAPI.update(pessoaId, pessoaParaAPI)
            sucessos++
            removerAlteracaoPendente('pessoas', pessoaId)
          }
        } catch (error) {
          console.error(`Erro ao salvar pessoa ${pessoaId}:`, error)
          erros++
        }
      }

      // Mostrar resultado
      if (erros === 0) {
        alert(`✅ Todas as ${sucessos} alterações foram salvas com sucesso!`)
      } else {
        alert(`⚠️ ${sucessos} alterações salvas com sucesso, ${erros} falharam. Verifique o console para detalhes.`)
      }

    } catch (error) {
      console.error('Erro geral ao salvar alterações:', error)
      alert('Erro ao salvar alterações. Tente novamente.')
    } finally {
      setSalvandoTudo(false)
    }
  }

  const updateAtividade = async (id, field, value) => {
    try {
      // Atualizar estado local primeiro para responsividade
      const updatedAtividades = atividades.map(atividade => {
        if (atividade.id === id) {
          const updatedAtividade = { ...atividade, [field]: value }
          
          // Cálculos automáticos baseados nas regras especificadas
          
          // PREVISÃO ENTREGA (AUTO) --> Buscar os dias (DIAS PREVISTOS) + DATA INÍCIO
          if (field === 'dataInicio' || field === 'diasPrevistos') {
            const dataInicio = field === 'dataInicio' ? value : updatedAtividade.dataInicio
            const diasPrevistos = field === 'diasPrevistos' ? value : updatedAtividade.diasPrevistos
            updatedAtividade.previsaoEntrega = calculatePrevisaoEntrega(dataInicio, diasPrevistos)
            
            // Recalcular STATUS PRAZO quando previsão de entrega muda
            updatedAtividade.statusPrazo = calculateStatusPrazo(updatedAtividade.previsaoEntrega)
          }
          
          // STATUS (AUTO) --> Busca do campo progresso %
          if (field === 'progresso') {
            updatedAtividade.status = calculateStatus(value)
          }
          
          // QTD HORAS (AUTO) = BUSCA DIAS PREVISTO * 7h diario
          if (field === 'diasPrevistos') {
            updatedAtividade.qtdHoras = value * 7
            // Recalcular diferença de horas quando qtd horas muda
            updatedAtividade.diferencaHoras = updatedAtividade.horasUtilizadas - updatedAtividade.qtdHoras
          }
          
          // DIFERENÇA HORAS (AUTO) --> HORAS UTILIZADAS - QTD HORAS (AUTO)
          if (field === 'horasUtilizadas') {
            updatedAtividade.diferencaHoras = value - updatedAtividade.qtdHoras
          }
          
          // STATUS PRAZO (AUTO) - recalcular quando previsão de entrega muda
          if (field === 'previsaoEntrega') {
            updatedAtividade.statusPrazo = calculateStatusPrazo(value)
          }
          
          return updatedAtividade
        }
        return atividade
      })
      
      setAtividades(updatedAtividades)
      
      // Marcar como alteração pendente
      marcarAlteracaoPendente('atividades', id)
      console.log('📝 Atividade marcada como alteração pendente:', id)
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error)
      // Reverter mudança local em caso de erro
      await carregarDados()
    }
  }

  const removeProjeto = async (id) => {
    try {
      // Encontrar o projeto que será removido
      const projetoParaRemover = projetos.find(projeto => projeto.id === id)
      if (!projetoParaRemover) {
        showModal('Erro', 'Projeto não encontrado.', 'error')
        return
      }

      // Verificar se existem atividades vinculadas a este projeto
      const atividadesVinculadas = atividades.filter(atividade => {
        // Verificar se a atividade está vinculada ao projeto pelo código ou nome
        const codigoProjetoAtividade = `${projetoParaRemover.codigo} - ${projetoParaRemover.nome}`
        return atividade.codigoProjeto === codigoProjetoAtividade || 
               atividade.projeto === projetoParaRemover.nome
      })

      // Se existem atividades vinculadas, impedir a remoção
      if (atividadesVinculadas.length > 0) {
        showModal(
          'Não é possível remover o projeto',
          `Este projeto possui ${atividadesVinculadas.length} atividade(s) vinculada(s). Para remover este projeto, primeiro exclua todas as atividades vinculadas a ele na aba "Atividades".`,
          'error'
        )
        return
      }

      // Mostrar modal de confirmação
      setDeleteModalData({
        projectId: id,
        projectName: projetoParaRemover.nome,
        title: 'Confirmar Remoção',
        message: 'Tem certeza que deseja remover este projeto? Esta ação não pode ser desfeita.'
      })
      setShowDeleteModal(true)
    } catch (error) {
      console.error('❌ Erro ao verificar projeto:', error)
      showModal('Erro', 'Erro ao verificar projeto. Tente novamente.', 'error')
    }
  }

  // Função para confirmar a remoção do projeto
  const confirmarRemocaoProjeto = async () => {
    try {
      const { projectId, projectName } = deleteModalData
      
      // Remover do estado local primeiro para responsividade
      setProjetos(projetos.filter(projeto => projeto.id !== projectId))
      
      // Fechar modal
      setShowDeleteModal(false)
      
      // Remover da API
      await projetosAPI.delete(projectId)
      console.log('✅ Projeto removido com sucesso')
      mostrarNotificacao(`✅ Projeto "${projectName}" removido com sucesso!`, 'success')
    } catch (error) {
      console.error('❌ Erro ao remover projeto:', error)
      // Reverter mudança local em caso de erro
      await carregarDados()
      showModal('Erro', 'Erro ao remover projeto. Tente novamente.', 'error')
    }
  }

  const removePessoa = async (id) => {
    try {
      // Encontrar a pessoa para inativar
      const pessoa = pessoas.find(p => p.id === id)
      if (!pessoa) {
        alert('Pessoa não encontrada.')
        return
      }

      // Confirmar inativação
      if (!confirm(`Tem certeza que deseja inativar ${pessoa.nome}?`)) {
        return
      }

      // Inativar pessoa (definir ativo = 0)
      const pessoaInativada = { ...pessoa, ativo: 0 }
      
      // Atualizar no backend
      await pessoasAPI.update(id, pessoaInativada)
      
      // Atualizar estado local
      setPessoas(pessoas.map(p => p.id === id ? pessoaInativada : p))
      
      console.log('✅ Pessoa inativada com sucesso')
      alert('Pessoa inativada com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao inativar pessoa:', error)
      alert('Erro ao inativar pessoa. Tente novamente.')
    }
  }

  const removeAtividade = async (id) => {
    try {
      // Remover do estado local primeiro para responsividade
      setAtividades(atividades.filter(atividade => atividade.id !== id))
      
      // Remover da API
      await atividadesAPI.delete(id)
      console.log('✅ Atividade removida com sucesso')
    } catch (error) {
      console.error('❌ Erro ao remover atividade:', error)
      // Reverter mudança local em caso de erro
      await carregarDados()
      alert('Erro ao remover atividade. Tente novamente.')
    }
  }

  const salvarAtividade = async (id) => {
    try {
      const atividade = atividades.find(a => a.id === id)
      if (!atividade) {
        alert('Atividade não encontrada.')
        return
      }

      // Salvar na API
      await atividadesAPI.update(id, atividade)
      console.log('✅ Atividade salva com sucesso')
      
      // Mostrar notificação de sucesso
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error)
      alert('Erro ao salvar atividade. Tente novamente.')
    }
  }

  const editarAtividade = (id) => {
    // Definir a atividade como sendo editada
    setEditingActivity(id)
    console.log(`✏️ Editando atividade ID: ${id}`)
    
    // Mostrar notificação
    alert(`Modo de edição ativado para a atividade ID: ${id}`)
  }

  const renderProjetos = () => (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #00529B 0%, #FDBB31 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          📁 Projetos
        </h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={addProjeto} 
            style={{ 
              background: 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)',
              color: '#00529B', 
              border: '2px solid #00529B', 
              borderRadius: '16px', 
              padding: '16px 32px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              boxShadow: '0 8px 25px rgba(253, 187, 49, 0.4)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = '0 12px 35px rgba(253, 187, 49, 0.6)'
              e.target.style.background = 'linear-gradient(135deg, #FFD700 0%, #FDBB31 100%)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 25px rgba(253, 187, 49, 0.4)'
              e.target.style.background = 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)'
            }}
          >
            ✨ Novo Projeto
          </button>
          <button 
            onClick={salvarDados} 
            style={{ 
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '16px', 
              padding: '16px 32px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              boxShadow: '0 8px 25px rgba(40, 167, 69, 0.4)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = '0 12px 35px rgba(40, 167, 69, 0.6)'
              e.target.style.background = 'linear-gradient(135deg, #20c997 0%, #28a745 100%)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)'
              e.target.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
            }}
          >
            💾 Salvar
          </button>
        </div>
      </div>
      
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto',
        borderRadius: '16px',
        height: 'calc(100vh - 200px)',
        border: '2px solid #00529B',
        boxShadow: '0 8px 25px rgba(0, 82, 155, 0.2)'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          minWidth: '2800px',
          position: 'relative'
        }}>
          <thead style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10,
            background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)'
          }}>
            <tr style={{ 
              borderBottom: '3px solid #FDBB31'
            }}>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Código <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '300px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Nome <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '400px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Descrição <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '70px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Prioridade <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '200px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Responsáveis <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '90px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Início Planejado <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '90px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Fim Planejado <span style={{ color: '#FDBB31', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Aprovação</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Início Real</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Fim Previsto</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Qtd Horas</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Total Tarefas</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Em Andamento</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Finalizadas</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Não Iniciado</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '60px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Cancelado</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Dentro Prazo</th>
              <th style={{ padding: '16px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', background: 'rgba(0, 0, 0, 0.3)', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Fora Prazo</th>
              <th style={{ padding: '16px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Progresso Geral</th>
              <th style={{ padding: '16px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '120px', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetos.length === 0 ? (
              <tr>
                <td colSpan="20" style={{ 
                  padding: '60px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '48px' }}>📋</span>
                    <span>Nenhum projeto cadastrado</span>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                      Clique em "Novo Projeto" para começar
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              projetos.map((projeto, index) => (
                <tr key={projeto.id} style={{ 
                  borderBottom: '1px solid #e2e8f0',
                  background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'}>
                  
                  {/* Código */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={projeto.codigo}
                      onChange={(e) => updateProjeto(projeto.id, 'codigo', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: camposComErro[`${projeto.id}_codigo`] ? '2px solid #dc2626' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        backgroundColor: camposComErro[`${projeto.id}_codigo`] ? '#fef2f2' : 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  
                  {/* Nome */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={projeto.nome}
                      onChange={(e) => updateProjeto(projeto.id, 'nome', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: camposComErro[`${projeto.id}_nome`] ? '2px solid #dc2626' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        backgroundColor: camposComErro[`${projeto.id}_nome`] ? '#fef2f2' : 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  
                  {/* Descrição */}
                  <td style={{ padding: '8px' }}>
                    <textarea
                      value={projeto.descricao}
                      onChange={(e) => updateProjeto(projeto.id, 'descricao', e.target.value)}
                      rows="2"
                      style={{ 
                        width: '100%', 
                        border: camposComErro[`${projeto.id}_descricao`] ? '2px solid #dc2626' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        resize: 'vertical',
                        backgroundColor: camposComErro[`${projeto.id}_descricao`] ? '#fef2f2' : 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  
                  {/* Prioridade */}
                  <td style={{ padding: '8px' }}>
                    <select
                      value={projeto.prioridade}
                      onChange={(e) => updateProjeto(projeto.id, 'prioridade', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: camposComErro[`${projeto.id}_prioridade`] ? '2px solid #dc2626' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        background: camposComErro[`${projeto.id}_prioridade`] ? '#fef2f2' : (projeto.prioridade === 'Alta' ? '#fef2f2' : (projeto.prioridade === 'Média' ? '#fef3c7' : '#f0fdf4')),
                        color: projeto.prioridade === 'Alta' ? '#991b1b' : (projeto.prioridade === 'Média' ? '#92400e' : '#166534'),
                        fontWeight: '600'
                      }}
                    >
                      <option value="">Selecione a prioridade</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </td>
                  
                  {/* Responsáveis */}
                  <td style={{ padding: '8px' }}>
                    <ResponsaveisDropdown 
                      projeto={projeto} 
                      pessoas={pessoas} 
                      updateProjeto={updateProjeto}
                      hasError={camposComErro[`${projeto.id}_responsaveis`]}
                    />
                  </td>
                  
                  {/* Início Planejado */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="date"
                      value={formatDateForInput(projeto.inicioPlaneado)}
                      onChange={(e) => updateProjeto(projeto.id, 'inicioPlaneado', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: camposComErro[`${projeto.id}_inicioPlaneado`] ? '2px solid #dc2626' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        backgroundColor: camposComErro[`${projeto.id}_inicioPlaneado`] ? '#fef2f2' : 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  
                  {/* Fim Planejado */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="date"
                      value={formatDateForInput(projeto.fimPlaneado)}
                      onChange={(e) => updateProjeto(projeto.id, 'fimPlaneado', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: camposComErro[`${projeto.id}_fimPlaneado`] ? '2px solid #dc2626' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        backgroundColor: camposComErro[`${projeto.id}_fimPlaneado`] ? '#fef2f2' : 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea'
                        e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  
                  {/* Aprovação */}
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <input
                        type="checkbox"
                        checked={projeto.aprovacao === true || projeto.aprovacao === 'true' || projeto.aprovacao === 1}
                        onChange={(e) => {
                          updateProjeto(projeto.id, 'aprovacao', e.target.checked)
                        }}
                        style={{ 
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#00529B'
                        }}
                      />
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: projeto.aprovacao === true || projeto.aprovacao === 'true' || projeto.aprovacao === 1 ? '#166534' : '#991b1b'
                      }}>
                        {projeto.aprovacao === true || projeto.aprovacao === 'true' || projeto.aprovacao === 1 ? '✅ Aprovado' : '❌ Pendente'}
                      </span>
                    </div>
                  </td>
                  
                  {/* Início Real (Calculado das Atividades) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        
                        // Encontra a data de início mais antiga
                        const datasInicio = atividadesProjeto
                          .map(a => a.dataInicio)
                          .filter(data => data && data !== '')
                          .map(data => {
                            // Converte para formato ISO para comparação correta
                            if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                              const [day, month, year] = data.split('/');
                              return `${year}-${month}-${day}`;
                            }
                            return data;
                          })
                          .sort(); // Agora ordena corretamente no formato ISO
                        
                        return datasInicio.length > 0 ? formatDateForDisplay(datasInicio[0]) : '';
                      })()}
                      readOnly
                      placeholder="dd/mm/yyyy"
                      style={{ 
                        width: '100%', 
                        border: '1px solid #374151', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        background: '#00529B',
                        color: '#FDBB31',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}
                    />
                  </td>
                  
                  {/* Fim Previsto (Calculado das Atividades) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        
                        // Encontra a data de entrega mais tardia
                        const datasEntrega = atividadesProjeto
                          .map(a => a.previsaoEntrega)
                          .filter(data => data && data !== '')
                          .map(data => {
                            // Converte para formato ISO para comparação correta
                            if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                              const [day, month, year] = data.split('/');
                              return `${year}-${month}-${day}`;
                            }
                            return data;
                          })
                          .sort((a, b) => new Date(b) - new Date(a)); // Ordena do maior para o menor
                        
                        return datasEntrega.length > 0 ? formatDateForDisplay(datasEntrega[0]) : '';
                      })()}
                      readOnly
                      placeholder="dd/mm/yyyy"
                      style={{ 
                        width: '100%', 
                        border: '1px solid #374151', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        background: '#00529B',
                        color: '#FDBB31',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '120px'
                      }}
                    />
                  </td>
                  
                  {/* Qtd Horas (AUTO) - Soma das atividades */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto com lógica robusta
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.reduce((total, a) => total + (a.qtdHoras || 0), 0);
                      })()}
                      readOnly
                      style={{ 
                        width: '100%', 
                        border: '1px solid #374151', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        background: '#00529B',
                        color: '#FDBB31',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}
                    />
                  </td>
                  
                  {/* Total Tarefas (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto com lógica robusta
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.length;
                      })()}
                      readOnly
                      style={{ 
                        width: '100%', 
                        border: '1px solid #374151', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        background: '#374151',
                        color: '#f9fafb',
                        fontWeight: '600'
                      }}
                    />
                  </td>
                  
                  {/* Em Andamento (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto com lógica robusta
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.filter(a => {
                          const progresso = a.progresso || 0;
                          return progresso > 0 && progresso < 100;
                        }).length;
                      })()}
                      readOnly
                      style={{ 
                        width: '100%', 
                        border: '1px solid #374151', 
                        borderRadius: '4px', 
                        padding: '8px',
                        fontSize: '12px',
                        background: '#374151',
                        color: '#f9fafb',
                        fontWeight: '600'
                      }}
                    />
                  </td>
                  
                  {/* Finalizadas (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto com lógica robusta
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.filter(a => (a.progresso || 0) === 100).length;
                      })()}
                      readOnly
                      style={{
                        border: '1px solid #00529B',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '12px',
                        background: '#00529B',
                        color: '#FDBB31',
                        fontWeight: '600',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}
                    />
                  </td>
                  
                  {/* Não Iniciado (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto com lógica robusta
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.filter(a => (a.progresso || 0) === 0).length;
                      })()}
                      readOnly
                      style={{
                        border: '1px solid #6b7280',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '12px',
                        background: '#6b7280',
                        color: '#f9fafb',
                        fontWeight: '600'
                      }}
                    />
                  </td>
                  
                  {/* Cancelado (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto com lógica robusta
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.filter(a => (a.progresso || 0) === -1).length;
                      })()}
                      readOnly
                      style={{
                        border: '1px solid #dc2626',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '12px',
                        background: '#dc2626',
                        color: '#f9fafb',
                        fontWeight: '600'
                      }}
                    />
                  </td>
                  
                  {/* Dentro Prazo (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.filter(a => a.statusPrazo === 'Dentro do Prazo').length;
                      })()}
                      readOnly
                      style={{
                        border: '1px solid #10b981',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '12px',
                        background: '#10b981',
                        color: '#f9fafb',
                        fontWeight: '600'
                      }}
                    />
                  </td>
                  
                  {/* Fora Prazo (Não Editável) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      value={(() => {
                        // Busca atividades vinculadas ao projeto
                        const atividadesProjeto = atividades.filter(a => {
                          const codigoProjeto = a.codigoProjeto || a.projeto;
                          return (
                            codigoProjeto === projeto.codigo ||
                            codigoProjeto === projeto.nome ||
                            a.projeto === projeto.nome ||
                            codigoProjeto?.includes(projeto.codigo) ||
                            codigoProjeto?.startsWith(projeto.codigo)
                          );
                        });
                        return atividadesProjeto.filter(a => a.statusPrazo === 'Fora do Prazo').length;
                      })()}
                      readOnly
                      style={{
                        border: '1px solid #ef4444',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '12px',
                        background: '#ef4444',
                        color: '#f9fafb',
                        fontWeight: '600'
                      }}
                    />
                  </td>

                  
                  {/* Progresso Geral (AUTO) */}
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {projeto.aprovacao === true || projeto.aprovacao === 'true' || projeto.aprovacao === 1 || (projeto.aprovacao && projeto.aprovacao !== '' && projeto.aprovacao !== 'false') ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '8px',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(() => {
                              // Busca atividades vinculadas ao projeto com lógica robusta
                              const atividadesProjeto = atividades.filter(a => {
                                const codigoProjeto = a.codigoProjeto || a.projeto;
                                return (
                                  codigoProjeto === projeto.codigo ||
                                  codigoProjeto === projeto.nome ||
                                  a.projeto === projeto.nome ||
                                  codigoProjeto?.includes(projeto.codigo) ||
                                  codigoProjeto?.startsWith(projeto.codigo)
                                );
                              });
                              if (atividadesProjeto.length === 0) return 0;
                              const progressoTotal = atividadesProjeto.reduce((sum, a) => sum + (a.progresso || 0), 0);
                              return Math.round(progressoTotal / atividadesProjeto.length);
                            })()}%`,
                            height: '100%',
                            background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#00529B'
                        }}>
                          {(() => {
                            // Busca atividades vinculadas ao projeto com lógica robusta
                            const atividadesProjeto = atividades.filter(a => {
                              const codigoProjeto = a.codigoProjeto || a.projeto;
                              return (
                                codigoProjeto === projeto.codigo ||
                                codigoProjeto === projeto.nome ||
                                a.projeto === projeto.nome ||
                                codigoProjeto?.includes(projeto.codigo) ||
                                codigoProjeto?.startsWith(projeto.codigo)
                              );
                            });
                            if (atividadesProjeto.length === 0) return '0%';
                            const progressoTotal = atividadesProjeto.reduce((sum, a) => sum + (a.progresso || 0), 0);
                            return Math.round(progressoTotal / atividadesProjeto.length) + '%';
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        Aguardando aprovação
                      </span>
                    )}
                  </td>
                  
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => removeProjeto(projeto.id)}
                      style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        color: '#FEFEFE',
                        border: '2px solid #dc2626',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        margin: '2px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '700',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)'
                        e.target.style.boxShadow = '0 6px 18px rgba(220, 38, 38, 0.5)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
                      }}
                    >
                      🗑️ Remover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderAtividades = () => (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0, 82, 155, 0.3)'
        }}>
          ⚡ Atividades
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#00529B',
            background: 'rgba(0, 82, 155, 0.1)',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '2px solid #00529B'
          }}>
            Total: {atividades.length} | Concluídas: {atividades.filter(a => a.status === 'Concluído').length}
          </span>

          <button 
            onClick={() => setShowActivityModal(true)}
            style={{ 
              background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '16px 32px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 8px 25px rgba(0, 82, 155, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 12px 35px rgba(0, 82, 155, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 25px rgba(0, 82, 155, 0.3)'
            }}
          >
            ✨ Adicionar Atividade
          </button>
          <button 
            onClick={salvarDados} 
            style={{ 
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '16px 32px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 8px 25px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 12px 35px rgba(40, 167, 69, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.3)'
            }}
          >
            💾 Salvar
          </button>
        </div>
      </div>
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto',
        borderRadius: '16px',
        height: 'calc(100vh - 200px)',
        border: '2px solid #00529B',
        boxShadow: '0 8px 25px rgba(0, 82, 155, 0.2)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '2800px' }}>
          <thead>
            <tr style={{ 
              background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
              borderBottom: '3px solid #FDBB31',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '120px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Código Projeto</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '200px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Projeto</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '150px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Resp. Projeto</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '110px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Início Plan.</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '110px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Fim Plan.</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '250px', background: 'rgba(0, 0, 0, 0.1)' }}>Tarefa <span style={{ color: '#FF6B6B', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '180px', background: 'rgba(0, 0, 0, 0.1)' }}>Resp. Tarefa <span style={{ color: '#FF6B6B', fontSize: '14px' }}>*</span></th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', background: 'rgba(0, 0, 0, 0.1)' }}>Dias Prev.</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '110px', background: 'rgba(0, 0, 0, 0.1)' }}>Data Início</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '110px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Prev. Entrega</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Status</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Status Prazo</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', background: 'rgba(0, 0, 0, 0.1)' }}>Progresso %</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>QTD Horas</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', background: 'rgba(0, 0, 0, 0.1)' }}>Horas Usadas</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Dif. Horas</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#FDBB31', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '150px', background: 'rgba(0, 0, 0, 0.1)' }}>Observações</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {atividades.length === 0 ? (
              <tr>
                <td colSpan="18" style={{ 
                  padding: '60px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '48px' }}>⚡</span>
                    <span>Nenhuma atividade cadastrada</span>
                  </div>
                </td>
              </tr>
            ) : (
              atividades.map((atividade, index) => (
                <tr key={atividade.id} style={{ 
                  borderBottom: '1px solid #00529B',
                  background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(253, 187, 49, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'}>
                  {/* CÓDIGO PROJETO (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#00529B' }}>
                    {atividade.codigoProjeto || `${atividade.codigo} - ${atividade.projeto}`}
                  </td>
                  {/* PROJETO (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', fontWeight: '500', color: '#333' }}>
                    {atividade.projeto}
                  </td>
                  {/* RESPONSÁVEL PROJETO (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', color: '#333' }}>
                    {(() => {
                      const responsaveis = atividade.responsavelProjeto || atividade.responsavel || '';
                      if (!responsaveis) return '-';
                      
                      // Se contém vírgula, são múltiplos responsáveis
                      if (responsaveis.includes(',')) {
                        const listaResponsaveis = responsaveis.split(',').map(r => r.trim()).filter(r => r);
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {listaResponsaveis.map((responsavel, index) => (
                              <span
                                key={index}
                                style={{
                                  background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: '500',
                                  boxShadow: '0 2px 6px rgba(0, 82, 155, 0.3)',
                                  display: 'inline-block',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {responsavel}
                              </span>
                            ))}
                          </div>
                        );
                      } else {
                        // Responsável único
                        return (
                          <span
                            style={{
                              background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '500',
                              boxShadow: '0 2px 6px rgba(0, 82, 155, 0.3)',
                              display: 'inline-block',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {responsaveis}
                          </span>
                        );
                      }
                    })()}
                  </td>
                  {/* INÍCIO PLANEJADO (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', color: '#333' }}>
                    {formatDateForDisplay(atividade.inicioPlaneado)}
                  </td>
                  {/* FIM PLANEJADO (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', color: '#333' }}>
                    {formatDateForDisplay(atividade.fimPlaneado)}
                  </td>
                  {/* TAREFA (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={atividade.tarefa || atividade.nome}
                      onChange={(e) => updateAtividade(atividade.id, 'tarefa', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: camposComErroAtividades[`${atividade.id}_tarefa`] ? '2px solid #dc2626' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: camposComErroAtividades[`${atividade.id}_tarefa`] ? '#fef2f2' : '#fef3c7',
                        color: '#000',
                        cursor: 'text',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        if (!camposComErroAtividades[`${atividade.id}_tarefa`]) {
                          e.target.style.borderColor = '#667eea'
                          e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)'
                        }
                      }}
                      onBlur={(e) => {
                        if (!camposComErroAtividades[`${atividade.id}_tarefa`]) {
                          e.target.style.borderColor = '#e5e7eb'
                          e.target.style.boxShadow = 'none'
                        }
                      }}
                    />
                  </td>
                  {/* RESPONSÁVEIS TAREFA (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    <ResponsaveisTarefaDropdown
                      atividade={atividade}
                      pessoas={pessoas}
                      updateAtividade={updateAtividade}
                      disabled={false}
                      hasError={camposComErroAtividades[`${atividade.id}_responsaveisTarefa`]}
                    />
                  </td>
                  {/* DIAS PREVISTOS (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      value={atividade.diasPrevistos || 5}
                      onChange={(e) => updateAtividade(atividade.id, 'diasPrevistos', parseInt(e.target.value) || 1)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#fef3c7',
                        color: '#000',
                        cursor: 'text'
                      }}
                    />
                  </td>
                  {/* DATA INÍCIO (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="date"
                      value={formatDateForInput(atividade.dataInicio)}
                      onChange={(e) => updateAtividade(atividade.id, 'dataInicio', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#fef3c7',
                        color: '#000',
                        cursor: 'text'
                      }}
                    />
                  </td>
                  {/* PREVISÃO ENTREGA (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', color: '#333', background: '#f0f9ff' }}>
                    {formatDateForDisplay(atividade.previsaoEntrega)}
                  </td>
                  {/* STATUS (AUTO) */}
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      background: atividade.status === 'Concluído' ? '#dcfce7' : 
                                 atividade.status === 'Em Andamento' ? '#fef3c7' : 
                                 atividade.status === 'Cancelado' ? '#fee2e2' : '#f1f5f9',
                      color: atividade.status === 'Concluído' ? '#166534' : 
                             atividade.status === 'Em Andamento' ? '#92400e' : 
                             atividade.status === 'Cancelado' ? '#991b1b' : '#64748b'
                    }}>
                      {atividade.status}
                    </span>
                  </td>
                  {/* STATUS PRAZO (AUTO) */}
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      background: atividade.statusPrazo === 'Dentro do Prazo' ? '#dcfce7' : '#fee2e2',
                      color: atividade.statusPrazo === 'Dentro do Prazo' ? '#166534' : '#991b1b'
                    }}>
                      {atividade.statusPrazo || 'Dentro do Prazo'}
                    </span>
                  </td>
                  {/* PROGRESSO % (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    {(() => {
                      const codigoProjeto = atividade.codigoProjeto || atividade.projeto;
                      
                      // Busca o projeto de múltiplas formas para garantir compatibilidade
                      const projeto = projetos.find(p => 
                        p.codigo === codigoProjeto || 
                        p.nome === codigoProjeto ||
                        p.nome === atividade.projeto ||
                        codigoProjeto?.includes(p.codigo) ||
                        codigoProjeto?.startsWith(p.codigo)
                      );
                      
                      const isAprovado = projeto?.aprovacao === true || projeto?.aprovacao === 'true' || projeto?.aprovacao === 1;
                      
                      return (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={atividade.progresso === 0 ? '' : (atividade.progresso || '')}
                          placeholder="0"
                          onChange={(e) => updateAtividade(atividade.id, 'progresso', parseInt(e.target.value) || 0)}
                          disabled={!isAprovado}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: `1px solid ${isAprovado ? '#e5e7eb' : '#d1d5db'}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            background: isAprovado ? '#fef3c7' : '#f3f4f6',
                            color: isAprovado ? '#000' : '#9ca3af',
                            cursor: isAprovado ? 'text' : 'not-allowed'
                          }}
                          title={!isAprovado ? 'Projeto deve estar aprovado para editar progresso' : ''}
                        />
                      );
                    })()}
                  </td>
                  {/* QTD HORAS (AUTO) */}
                  <td style={{ padding: '8px', fontSize: '12px', color: '#333', background: '#f0f9ff' }}>
                    {atividade.qtdHoras || (atividade.diasPrevistos || 5) * 7}h
                  </td>
                  {/* HORAS UTILIZADAS (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      value={atividade.horasUtilizadas === 0 ? '' : (atividade.horasUtilizadas || '')}
                      placeholder="0"
                      onChange={(e) => updateAtividade(atividade.id, 'horasUtilizadas', parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#fef3c7',
                        color: '#000',
                        cursor: 'text'
                      }}
                    />
                  </td>
                  {/* DIFERENÇA HORAS (AUTO) */}
                  <td style={{ 
                    padding: '8px', 
                    fontSize: '12px', 
                    color: (atividade.diferencaHoras || 0) <= 0 ? '#166534' : '#991b1b',
                    background: '#f0f9ff',
                    fontWeight: '600'
                  }}>
                    {(atividade.diferencaHoras || 0) >= 0 ? '+' : ''}{atividade.diferencaHoras || 0}h
                  </td>
                  {/* OBSERVAÇÕES (MANUAL) */}
                  <td style={{ padding: '8px' }}>
                    <textarea
                      value={atividade.observacoes || ''}
                      onChange={(e) => updateAtividade(atividade.id, 'observacoes', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#fef3c7',
                        color: '#000',
                        cursor: 'text',
                        minHeight: '40px',
                        resize: 'vertical'
                      }}
                      placeholder="Observações..."
                    />
                  </td>
                  {/* AÇÕES */}
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                      {/* Botão Editar */}
                      <button
                        onClick={() => editarAtividade(atividade.id)}
                        style={{
                          background: 'linear-gradient(135deg, #0066CC 0%, #0080FF 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontWeight: '600',
                          boxShadow: '0 2px 6px rgba(0, 102, 204, 0.3)',
                          transition: 'all 0.2s ease',
                          minWidth: '60px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)'
                          e.target.style.boxShadow = '0 3px 8px rgba(0, 102, 204, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = '0 2px 6px rgba(0, 102, 204, 0.3)'
                        }}
                        title="Editar atividade"
                      >
                        ✏️ Editar
                      </button>
                      
                      {/* Botão Remover */}
                      <button
                        onClick={() => removeAtividade(atividade.id)}
                        style={{
                          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontWeight: '600',
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
                          transition: 'all 0.2s ease',
                          minWidth: '60px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)'
                          e.target.style.boxShadow = '0 3px 8px rgba(220, 38, 38, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = '0 2px 6px rgba(220, 38, 38, 0.3)'
                        }}
                        title="Remover atividade"
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderPessoas = () => (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0, 82, 155, 0.3)'
        }}>
          👥 Pessoas
        </h2>
        <button 
          onClick={addPessoa} 
          style={{ 
            background: 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)',
            color: '#00529B', 
            border: '2px solid #00529B', 
            borderRadius: '12px', 
            padding: '16px 32px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '700',
            boxShadow: '0 8px 25px rgba(253, 187, 49, 0.4)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)'
            e.target.style.boxShadow = '0 12px 35px rgba(253, 187, 49, 0.6)'
            e.target.style.background = 'linear-gradient(135deg, #FFD700 0%, #FDBB31 100%)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 25px rgba(253, 187, 49, 0.4)'
            e.target.style.background = 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)'
          }}
        >
          ✨ Nova Pessoa
        </button>
      </div>
      <div style={{ 
        overflowX: 'auto', 
        overflowY: 'auto',
        borderRadius: '16px',
        maxHeight: '85vh',
        border: '2px solid #00529B',
        boxShadow: '0 8px 32px rgba(0, 82, 155, 0.15)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)'
          }}>
            <tr style={{ 
              background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
              borderBottom: '3px solid #FDBB31'
            }}>
              <th style={{ 
                padding: '20px 16px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#FEFEFE', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                minWidth: '80px'
              }}>Código</th>
              <th style={{ 
                padding: '20px 16px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#FEFEFE', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                minWidth: '150px'
              }}>Nome</th>
              <th style={{ 
                padding: '20px 16px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#FEFEFE', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                minWidth: '180px'
              }}>Email</th>
              <th style={{ 
                padding: '20px 16px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#FEFEFE', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                minWidth: '120px'
              }}>Cargo</th>
              <th style={{ 
                padding: '20px 16px', 
                textAlign: 'left', 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#FEFEFE', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                minWidth: '120px'
              }}>Departamento</th>
              <th style={{ 
                padding: '20px 16px', 
                textAlign: 'center', 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#FDBB31', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                background: 'rgba(0, 0, 0, 0.3)',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                minWidth: '100px'
              }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ 
                  padding: '60px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '48px' }}>👥</span>
                    <span>Nenhuma pessoa cadastrada</span>
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                      Clique em "Nova Pessoa" para começar
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              pessoas.filter(pessoa => pessoa.ativo !== 0).map((pessoa, index) => (
                <tr key={pessoa.id} style={{ 
                  borderBottom: '1px solid #e2e8f0',
                  background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'}>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={pessoa.codigo}
                      readOnly
                      style={{ 
                        width: '100%', 
                        border: '2px solid #00529B', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#475569'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={pessoa.nomeCompleto}
                      onChange={(e) => updatePessoa(pessoa.id, 'nomeCompleto', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '12px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FDBB31'
                        e.target.style.boxShadow = '0 0 0 3px rgba(253, 187, 49, 0.2)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#00529B'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="email"
                      value={pessoa.email}
                      onChange={(e) => updatePessoa(pessoa.id, 'email', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '12px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FDBB31'
                        e.target.style.boxShadow = '0 0 0 3px rgba(253, 187, 49, 0.2)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={pessoa.cargo}
                      onChange={(e) => updatePessoa(pessoa.id, 'cargo', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '12px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f59e0b'
                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={pessoa.departamento}
                      onChange={(e) => updatePessoa(pessoa.id, 'departamento', e.target.value)}
                      style={{ 
                        width: '100%', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '12px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f59e0b'
                        e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => removePessoa(pessoa.id)}
                        style={{ 
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          padding: '10px 16px', 
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        ⏸️ Inativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSubAtividades = () => (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0, 82, 155, 0.3)'
        }}>
          📋 SubAtividades
        </h2>
        <button 
          onClick={addSubtarefa}
          style={{ 
            background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '16px 32px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(0, 82, 155, 0.3)',
            transition: 'all 0.3s ease',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 12px 35px rgba(0, 82, 155, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 8px 25px rgba(0, 82, 155, 0.3)'
          }}
        >
          ✨ Adicionar Subtarefa
        </button>
      </div>
      <div style={{ 
        maxHeight: '85vh', 
        overflowX: 'auto', 
        overflowY: 'auto',
        borderRadius: '16px',
        border: '2px solid #00529B',
        boxShadow: '0 8px 32px rgba(0, 82, 155, 0.15)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ 
              background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
              borderBottom: '3px solid #FDBB31',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <th style={{ padding: '20px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Código</th>
              <th style={{ padding: '20px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '150px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Nome</th>
              <th style={{ padding: '20px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '120px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Atividade</th>
              <th style={{ padding: '20px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '130px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Responsável</th>
              <th style={{ padding: '20px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#FEFEFE', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '120px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {subtarefas.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ 
                  padding: '60px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  fontSize: '18px',
                  fontWeight: '500'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '48px' }}>📋</span>
                    <span>Nenhuma subatividade cadastrada</span>
                  </div>
                </td>
              </tr>
            ) : (
              subtarefas.map((subtarefa, index) => (
                <tr key={subtarefa.id} style={{ 
                  borderBottom: '1px solid #00529B',
                  background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(253, 187, 49, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'}>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#00529B' }}>{subtarefa.codigo}</td>
                  <td style={{ padding: '16px' }}>
                    <input
                      type="text"
                      value={subtarefa.nome || ''}
                      onChange={(e) => updateSubtarefa(subtarefa.id, 'nome', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333',
                        background: '#fef3c7',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#00529B'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={subtarefa.atividadeId || ''}
                      onChange={(e) => updateSubtarefa(subtarefa.id, 'atividadeId', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#00529B',
                        fontWeight: '600',
                        background: '#fef3c7',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#00529B'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="">Selecione uma atividade</option>
                      {atividades.map(atividade => (
                        <option key={atividade.id} value={atividade.id}>
                          {atividade.tarefa || atividade.nome}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <input
                      type="text"
                      value={subtarefa.responsavel || ''}
                      onChange={(e) => updateSubtarefa(subtarefa.id, 'responsavel', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#333',
                        background: '#fef3c7',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#00529B'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={subtarefa.status || 'Pendente'}
                      onChange={(e) => updateSubtarefa(subtarefa.id, 'status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: subtarefa.status === 'Concluída' ? '#10b981' : 
                                   subtarefa.status === 'Em Andamento' ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluída">Concluída</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderIndicadores = () => {
    // Função para calcular métricas dos indicadores
    const calcularMetricas = () => {
      // Filtrar dados baseado nos filtros selecionados
      let projetosFiltrados = projetos.filter(projeto => {
        // Converter responsaveis para array se for string
        const responsaveisArray = Array.isArray(projeto.responsaveis) 
          ? projeto.responsaveis 
          : (projeto.responsaveis || '').split(', ').filter(r => r.trim())
        
        return (!filtrosProjeto || projeto.nome.toLowerCase().includes(filtrosProjeto.toLowerCase())) &&
               (!filtrosResponsavelProjeto || responsaveisArray.some(resp => resp.toLowerCase().includes(filtrosResponsavelProjeto.toLowerCase())))
      })

      let atividadesFiltradas = atividades.filter(atividade => {
        // Converter responsaveisTarefa para array se for string
        const responsaveisArray = Array.isArray(atividade.responsaveisTarefa) 
          ? atividade.responsaveisTarefa 
          : (atividade.responsaveisTarefa || '').split(', ').filter(r => r.trim())
        
        return (!filtrosProjeto || atividade.projeto.toLowerCase().includes(filtrosProjeto.toLowerCase())) &&
               (!filtrosResponsavelProjeto || atividade.responsavelProjeto.toLowerCase().includes(filtrosResponsavelProjeto.toLowerCase())) &&
               (!filtrosResponsavelAtividade || responsaveisArray.some(resp => resp.toLowerCase().includes(filtrosResponsavelAtividade.toLowerCase()))) &&
               (!filtrosStatus || atividade.status === filtrosStatus) &&
               (!filtrosStatusPrazo || atividade.statusPrazo === filtrosStatusPrazo)
      })

      // Métricas principais
      const totalProjetos = projetosFiltrados.length
      const totalTarefas = atividadesFiltradas.length
      const tarefasAtrasadas = atividadesFiltradas.filter(a => a.statusPrazo === 'Fora do Prazo').length
      const tarefasConcluidas = atividadesFiltradas.filter(a => a.status === 'Concluído').length
      const tarefasCanceladas = atividadesFiltradas.filter(a => a.status === 'Cancelado').length
      const tarefasEmAndamento = atividadesFiltradas.filter(a => a.status === 'Em Andamento').length
      const tarefasNaoIniciadas = atividadesFiltradas.filter(a => a.status === 'Não Iniciado').length
      const tarefasDentroDoPrazo = atividadesFiltradas.filter(a => a.statusPrazo === 'Dentro do Prazo').length

      // Calcular progresso geral
      const progressoTotal = atividadesFiltradas.reduce((acc, atividade) => acc + (atividade.progresso || 0), 0)
      const progressoMedio = totalTarefas > 0 ? Math.round(progressoTotal / totalTarefas) : 0

      // Métricas por responsável de projeto
      const metricasPorResponsavelProjeto = {}
      projetosFiltrados.forEach(projeto => {
        // Converter responsaveis de string para array
        const responsaveisArray = Array.isArray(projeto.responsaveis) 
          ? projeto.responsaveis 
          : (projeto.responsaveis || '').split(', ').filter(r => r.trim())
        
        responsaveisArray.forEach(responsavel => {
          if (!metricasPorResponsavelProjeto[responsavel]) {
            metricasPorResponsavelProjeto[responsavel] = {
              projetos: 0,
              tarefas: 0,
              concluidas: 0,
              emAndamento: 0,
              canceladas: 0
            }
          }
          metricasPorResponsavelProjeto[responsavel].projetos++
          
          const tarefasDoProjeto = atividadesFiltradas.filter(a => a.projeto === projeto.nome)
          metricasPorResponsavelProjeto[responsavel].tarefas += tarefasDoProjeto.length
          metricasPorResponsavelProjeto[responsavel].concluidas += tarefasDoProjeto.filter(a => a.status === 'Concluído').length
          metricasPorResponsavelProjeto[responsavel].emAndamento += tarefasDoProjeto.filter(a => a.status === 'Em Andamento').length
          metricasPorResponsavelProjeto[responsavel].canceladas += tarefasDoProjeto.filter(a => a.status === 'Cancelado').length
        })
      })

      // Métricas por responsável de atividade
      const metricasPorResponsavelAtividade = {}
      atividadesFiltradas.forEach(atividade => {
        // Converter responsaveisTarefa de string para array
        const responsaveisArray = Array.isArray(atividade.responsaveisTarefa) 
          ? atividade.responsaveisTarefa 
          : (atividade.responsaveisTarefa || '').split(', ').filter(r => r.trim())
        
        responsaveisArray.forEach(responsavel => {
          if (!metricasPorResponsavelAtividade[responsavel]) {
            metricasPorResponsavelAtividade[responsavel] = {
              tarefas: 0,
              projetos: new Set(),
              concluidas: 0,
              emAndamento: 0,
              canceladas: 0
            }
          }
          metricasPorResponsavelAtividade[responsavel].tarefas++
          metricasPorResponsavelAtividade[responsavel].projetos.add(atividade.projeto)
          if (atividade.status === 'Concluído') metricasPorResponsavelAtividade[responsavel].concluidas++
          if (atividade.status === 'Em Andamento') metricasPorResponsavelAtividade[responsavel].emAndamento++
          if (atividade.status === 'Cancelado') metricasPorResponsavelAtividade[responsavel].canceladas++
        })
      })

      // Converter Set para número
      Object.keys(metricasPorResponsavelAtividade).forEach(responsavel => {
        metricasPorResponsavelAtividade[responsavel].projetos = metricasPorResponsavelAtividade[responsavel].projetos.size
      })

      return {
        totalProjetos,
        totalTarefas,
        tarefasAtrasadas,
        tarefasConcluidas,
        tarefasCanceladas,
        tarefasEmAndamento,
        tarefasNaoIniciadas,
        tarefasDentroDoPrazo,
        progressoMedio,
        metricasPorResponsavelProjeto,
        metricasPorResponsavelAtividade,
        projetosFiltrados,
        atividadesFiltradas
      }
    }

    const metricas = calcularMetricas()

    return (
      <div style={{ 
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0, 82, 155, 0.3)'
          }}>
            📊 Indicadores de Performance
          </h2>
        </div>

        {/* Filtros Sofisticados */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '2px solid #00529B',
          boxShadow: '0 8px 25px rgba(0, 82, 155, 0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#00529B',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔍 Filtros Avançados
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Projetos
              </label>
              <input
                type="text"
                value={filtrosProjeto}
                onChange={(e) => setFiltrosProjeto(e.target.value)}
                placeholder="Filtrar por projeto..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00529B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Responsável Projeto
              </label>
              <input
                type="text"
                value={filtrosResponsavelProjeto}
                onChange={(e) => setFiltrosResponsavelProjeto(e.target.value)}
                placeholder="Filtrar por responsável..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00529B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Responsável Atividade
              </label>
              <input
                type="text"
                value={filtrosResponsavelAtividade}
                onChange={(e) => setFiltrosResponsavelAtividade(e.target.value)}
                placeholder="Filtrar por responsável..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00529B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Status
              </label>
              <select
                value={filtrosStatus}
                onChange={(e) => setFiltrosStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00529B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Todos os Status</option>
                <option value="Não Iniciado">Não Iniciado</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                Status Prazo
              </label>
              <select
                value={filtrosStatusPrazo}
                onChange={(e) => setFiltrosStatusPrazo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00529B'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 82, 155, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Todos os Prazos</option>
                <option value="Dentro do Prazo">Dentro do Prazo</option>
                <option value="Fora do Prazo">Fora do Prazo</option>
              </select>
            </div>
          </div>

          {/* Botão para limpar filtros */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => {
                setFiltrosProjeto('')
                setFiltrosResponsavelProjeto('')
                setFiltrosResponsavelAtividade('')
                setFiltrosStatus('')
                setFiltrosStatusPrazo('')
              }}
              style={{
                background: 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)',
                color: '#00529B',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(253, 187, 49, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 20px rgba(253, 187, 49, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 15px rgba(253, 187, 49, 0.3)'
              }}
            >
              🗑️ Limpar Filtros
            </button>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div style={{ marginBottom: '40px' }}>
          {/* Subtítulo Status */}
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#00529B',
            marginBottom: '20px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            📊 Status
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              { title: 'Total Projetos', value: metricas.totalProjetos, icon: '📁', color: '#00529B' },
              { title: 'Total Tarefas', value: metricas.totalTarefas, icon: '⚡', color: '#0066CC' },
              { title: 'Tarefas Concluídas', value: metricas.tarefasConcluidas, icon: '✅', color: '#10b981' },
              { title: 'Tarefas em Andamento', value: metricas.tarefasEmAndamento, icon: '🔄', color: '#f59e0b' },
              { title: 'Tarefas Canceladas', value: metricas.tarefasCanceladas, icon: '❌', color: '#ef4444' },
              { title: 'Tarefas Não Iniciadas', value: metricas.tarefasNaoIniciadas, icon: '⏸️', color: '#6b7280' }
            ].map((card, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: `2px solid ${card.color}`,
              boxShadow: `0 8px 25px ${card.color}20`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = `0 15px 40px ${card.color}30`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 8px 25px ${card.color}20`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{card.icon}</span>
                <div style={{
                  background: card.color,
                  color: 'white',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px'
                }}></div>
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: card.color,
                margin: '0 0 8px 0'
              }}>
                {card.value}
              </h3>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#64748b',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {card.title}
              </p>
            </div>
          ))}
          </div>
          
          {/* Subtítulo Status Prazo */}
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#00529B',
            marginBottom: '20px',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ⏰ Status Prazo
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              { title: 'Tarefas Dentro do Prazo', value: metricas.tarefasDentroDoPrazo, icon: '⏱️', color: '#059669' },
              { title: 'Tarefas Atrasadas', value: metricas.tarefasAtrasadas, icon: '⏰', color: '#dc2626' }
            ].map((card, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                animation: 'slideUp 0.6s ease-out',
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.12)'
                e.currentTarget.style.borderColor = card.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)'
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <span style={{
                    fontSize: '32px',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}>
                    {card.icon}
                  </span>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    color: card.color,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {card.value}
                  </div>
                </div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#64748b',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {card.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Detalhado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Visão por Projetos */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #00529B',
            boxShadow: '0 8px 25px rgba(0, 82, 155, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#00529B',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📁 Visão por Projetos
            </h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {metricas.projetosFiltrados.map((projeto, index) => {
                const tarefasDoProjeto = metricas.atividadesFiltradas.filter(a => a.projeto === projeto.nome)
                const concluidas = tarefasDoProjeto.filter(a => a.status === 'Concluído').length
                const emAndamento = tarefasDoProjeto.filter(a => a.status === 'Em Andamento').length
                const atrasadas = tarefasDoProjeto.filter(a => a.statusPrazo === 'Fora do Prazo').length
                const percentualConclusao = tarefasDoProjeto.length > 0 ? Math.round((concluidas / tarefasDoProjeto.length) * 100) : 0

                return (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#00529B', margin: '0 0 8px 0' }}>
                      {projeto.nome}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      Responsáveis: {Array.isArray(projeto.responsaveis) ? projeto.responsaveis.join(', ') : (projeto.responsaveis || '').split(', ').filter(r => r.trim()).join(', ')}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      fontSize: '12px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#00529B' }}>{tarefasDoProjeto.length}</div>
                        <div style={{ color: '#64748b' }}>Total</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#10b981' }}>{concluidas}</div>
                        <div style={{ color: '#64748b' }}>Concluídas</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#f59e0b' }}>{emAndamento}</div>
                        <div style={{ color: '#64748b' }}>Em Andamento</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: '#ef4444' }}>{atrasadas}</div>
                        <div style={{ color: '#64748b' }}>Atrasadas</div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '12px',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        height: '100%',
                        width: `${percentualConclusao}%`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                      {percentualConclusao}% Concluído
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visão por Responsável de Projeto */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #0066CC',
            boxShadow: '0 8px 25px rgba(0, 102, 204, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0066CC',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👤 Responsáveis de Projeto
            </h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {Object.entries(metricas.metricasPorResponsavelProjeto).map(([responsavel, dados], index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0066CC', margin: '0 0 12px 0' }}>
                    {responsavel}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#0066CC' }}>{dados.projetos}</div>
                      <div style={{ color: '#64748b' }}>Projetos</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#00529B' }}>{dados.tarefas}</div>
                      <div style={{ color: '#64748b' }}>Tarefas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#10b981' }}>{dados.concluidas}</div>
                      <div style={{ color: '#64748b' }}>Concluídas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#f59e0b' }}>{dados.emAndamento}</div>
                      <div style={{ color: '#64748b' }}>Em Andamento</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#ef4444' }}>{dados.canceladas}</div>
                      <div style={{ color: '#64748b' }}>Canceladas</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visão por Responsável de Atividade */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #10b981',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚡ Responsáveis de Atividade
            </h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {Object.entries(metricas.metricasPorResponsavelAtividade).map(([responsavel, dados], index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', margin: '0 0 12px 0' }}>
                    {responsavel}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#00529B' }}>{dados.projetos}</div>
                      <div style={{ color: '#64748b' }}>Projetos</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#10b981' }}>{dados.tarefas}</div>
                      <div style={{ color: '#64748b' }}>Tarefas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#10b981' }}>{dados.concluidas}</div>
                      <div style={{ color: '#64748b' }}>Concluídas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#f59e0b' }}>{dados.emAndamento}</div>
                      <div style={{ color: '#64748b' }}>Em Andamento</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', color: '#ef4444' }}>{dados.canceladas}</div>
                      <div style={{ color: '#64748b' }}>Canceladas</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição de Status */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #8b5cf6',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#8b5cf6',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📊 Distribuição de Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Concluídas', value: metricas.tarefasConcluidas, total: metricas.totalTarefas, color: '#10b981' },
                { label: 'Em Andamento', value: metricas.tarefasEmAndamento, total: metricas.totalTarefas, color: '#f59e0b' },
                { label: 'Não Iniciadas', value: metricas.tarefasNaoIniciadas, total: metricas.totalTarefas, color: '#6b7280' },
                { label: 'Canceladas', value: metricas.tarefasCanceladas, total: metricas.totalTarefas, color: '#ef4444' }
              ].map((item, index) => {
                const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
                return (
                  <div key={index} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{item.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: item.color }}>{item.value} ({percentage}%)</span>
                    </div>
                    <div style={{
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      height: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: item.color,
                        height: '100%',
                        width: `${percentage}%`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #00529B 0%, #0066CC 50%, #FDBB31 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '95vw', margin: '0 auto' }}>
        {/* Header Modernizado com Logo Nosso Atacarejo */}
        <div style={{ 
          background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
          borderRadius: '24px',
          padding: '32px 40px',
          marginBottom: '32px',
          boxShadow: '0 25px 80px rgba(0, 82, 155, 0.3)',
          border: '2px solid rgba(253, 187, 49, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Efeito de brilho sutil */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #FDBB31, transparent)',
            opacity: 0.8
          }}></div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            {/* Logo e Título */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <img 
                src="/LOGO.jpg" 
                alt="Nosso Atacarejo" 
                style={{ 
                  height: '80px', 
                  width: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  border: '3px solid #FDBB31'
                }} 
              />
              <div>
                <h1 style={{ 
                  fontSize: '42px', 
                  fontWeight: '900', 
                  color: '#FEFEFE',
                  margin: '0 0 8px 0',
                  letterSpacing: '-1px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  Sistema de Gerenciamento de Projetos
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#FDBB31',
                  margin: 0,
                  fontWeight: '600',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}>
                  Controle total de projetos e atividades
                </p>
              </div>
            </div>
            
            {/* Botão de Carregar Dados */}
            <button
              onClick={conectarDadosExemplo}
              style={{
                background: 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)',
                color: '#00529B',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(253, 187, 49, 0.4)',
                transition: 'all 0.3s ease',
                textShadow: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 12px 35px rgba(253, 187, 49, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 8px 25px rgba(253, 187, 49, 0.4)'
              }}
            >
              🔄 Carregar Dados de Exemplo
            </button>

            {/* Botão de Salvar Geral */}
            {(alteracoesPendentes.projetos.size > 0 || alteracoesPendentes.atividades.size > 0 || alteracoesPendentes.pessoas.size > 0) && (
              <button
                onClick={salvarTodasAlteracoes}
                disabled={salvandoTudo}
                style={{
                  background: salvandoTudo 
                    ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' 
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: salvandoTudo ? 'not-allowed' : 'pointer',
                  boxShadow: salvandoTudo 
                    ? '0 4px 15px rgba(156, 163, 175, 0.4)' 
                    : '0 8px 25px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease',
                  textShadow: 'none',
                  opacity: salvandoTudo ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!salvandoTudo) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.6)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!salvandoTudo) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)'
                  }
                }}
              >
                {salvandoTudo ? '⏳ Salvando...' : '💾 Salvar Todas as Alterações'}
              </button>
            )}
            

          </div>
          
          {/* Navegação com Abas Elegantes */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px',
            background: 'rgba(254, 254, 254, 0.1)',
            padding: '12px',
            borderRadius: '20px',
            border: '2px solid rgba(253, 187, 49, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            {[
              { id: 'pessoas', label: '👥 Pessoas', color: '#FDBB31' },
              { id: 'projetos', label: '📁 Projetos', color: '#FDBB31' },
              { id: 'atividades', label: '⚡ Atividades', color: '#FDBB31' },
              { id: 'subatividades', label: '📋 SubAtividades', color: '#FDBB31' },
              { id: 'indicadores', label: '📊 Indicadores', color: '#FDBB31' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #FDBB31 0%, #FFD700 100%)' 
                    : 'rgba(254, 254, 254, 0.1)',
                  color: activeTab === tab.id ? '#00529B' : '#FEFEFE',
                  border: activeTab === tab.id ? '2px solid #00529B' : '2px solid rgba(254, 254, 254, 0.2)',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: activeTab === tab.id 
                    ? '0 8px 25px rgba(253, 187, 49, 0.5)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  minWidth: '180px',
                  textShadow: activeTab === tab.id ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'rgba(253, 187, 49, 0.2)'
                    e.target.style.color = '#FDBB31'
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 6px 20px rgba(253, 187, 49, 0.3)'
                    e.target.style.border = '2px solid #FDBB31'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'rgba(254, 254, 254, 0.1)'
                    e.target.style.color = '#FEFEFE'
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
                    e.target.style.border = '2px solid rgba(254, 254, 254, 0.2)'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Conteúdo das Abas */}
        <div style={{ marginTop: '32px' }}>
          {activeTab === 'pessoas' && renderPessoas()}
          {activeTab === 'projetos' && renderProjetos()}
          {activeTab === 'atividades' && renderAtividades()}
          {activeTab === 'subatividades' && renderSubAtividades()}
          {activeTab === 'indicadores' && renderIndicadores()}
        </div>
      </div>

      {/* Modal para Criação de Tarefas em Lote */}
      {showBulkTaskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            animation: 'modalSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <style>
              {`
                @keyframes modalSlide {
                  from {
                    opacity: 0;
                    transform: translateY(-30px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
              `}
            </style>
            
            <h3 style={{
              fontSize: '24px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 32px 0',
              textAlign: 'center'
            }}>
              📋 Criar Tarefas em Lote
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Selecione o Projeto:
              </label>
              <select
                value={selectedProjectForTasks}
                onChange={(e) => setSelectedProjectForTasks(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Selecione um projeto...</option>
                {projetos.map(projeto => (
                  <option key={projeto.id} value={projeto.id}>
                    {projeto.codigo} - {projeto.nome}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Quantidade de Tarefas:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={taskQuantity}
                onChange={(e) => setTaskQuantity(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea'
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowBulkTaskModal(false)
                  setSelectedProjectForTasks('')
                  setTaskQuantity(1)
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f9fafb'
                  e.target.style.borderColor = '#d1d5db'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white'
                  e.target.style.borderColor = '#e5e7eb'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={createBulkTasks}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid #667eea',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                Criar Tarefas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Atividades */}
      {showActivityModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '2px solid #00529B'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#00529B',
              textAlign: 'center'
            }}>
              ⚡ Criar Atividades
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Selecionar Projeto:
              </label>
              <select
                value={selectedProjectForActivity}
                onChange={(e) => setSelectedProjectForActivity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00529B'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Escolha um projeto...</option>
                {projetos.map(projeto => (
                  <option key={projeto.id} value={projeto.codigo}>
                    {projeto.codigo} - {projeto.nome}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Quantidade de Atividades:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={activityQuantity}
                onChange={(e) => setActivityQuantity(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00529B'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowActivityModal(false)
                  setSelectedProjectForActivity('')
                  setActivityQuantity(1)
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f9fafb'
                  e.target.style.borderColor = '#d1d5db'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white'
                  e.target.style.borderColor = '#e5e7eb'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={createBulkActivities}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid #00529B',
                  background: 'linear-gradient(135deg, #00529B 0%, #0066CC 100%)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 82, 155, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 82, 155, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 82, 155, 0.3)'
                }}
              >
                Criar Atividades
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Erros de Validação */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
            border: '3px solid #dc2626',
            position: 'relative',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {/* Header do Modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #fee2e2'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ⚠️
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#dc2626'
                  }}>
                    Campos Obrigatórios
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Os seguintes campos precisam ser preenchidos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6'
                  e.target.style.color = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none'
                  e.target.style.color = '#9ca3af'
                }}
              >
                ×
              </button>
            </div>

            {/* Lista de Erros */}
            <div style={{
              marginBottom: '24px'
            }}>
              {errorDetails.map((erro, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#dc2626',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}></div>
                  <span style={{
                    fontSize: '14px',
                    color: '#7f1d1d',
                    fontWeight: '500'
                  }}>
                    {erro}
                  </span>
                </div>
              ))}
            </div>

            {/* Botão de Fechar */}
            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.3)'
                }}
              >
                Entendi, vou preencher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Confirmação de Salvamento */}
      {showSaveMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
          zIndex: 1000,
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          ✅ Dados salvos com sucesso!
        </div>
      )}

      {/* Modal de Confirmação Personalizado */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={closeModal}
        title={confirmationModalData.title}
        message={confirmationModalData.message}
        type={confirmationModalData.type}
      />

      {/* Modal de Confirmação de Remoção */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmarRemocaoProjeto}
          title={deleteModalData.title}
          message={deleteModalData.message}
          projectName={deleteModalData.projectName}
        />
      )}
    </div>
  )
}

export default App