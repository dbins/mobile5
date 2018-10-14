			//http://www.javascriptlint.com/online_lint.php
			
			//Funcoes do Phonegap
			var isPhoneGapReady = false;
			var isConnected = true;
			var isHighSpeed = false;
			var tipo_conexao = "";
			var email_aplicativo;
			var latitude = "";
			var longitude = "";
			
			
			//$(document).ready(function(){
			document.addEventListener("deviceready", onDeviceReady, false);
			//});
			 
			function onDeviceReady() {
				isPhoneGapReady = true;
				// detect for network access
				networkDetection();
				// attach events for online and offline detection
				document.addEventListener("online", onOnline, false);
				document.addEventListener("offline", onOffline, false);
			}
			
			function networkDetection() {
				if (isPhoneGapReady) {
					
					isConnected = false;
					var states = {};
					states[navigator.connection.UNKNOWN]  = 'Unknown connection';
					states[navigator.connection.ETHERNET] = 'Ethernet connection';
					states[navigator.connection.WIFI]     = 'WiFi connection';
					states[navigator.connection.CELL_2G]  = 'Cell 2G connection';
					states[navigator.connection.CELL_3G]  = 'Cell 3G connection';
					states[navigator.connection.CELL_4G]  = 'Cell 4G connection';
					states[navigator.connection.NONE]     = 'No network connection';
					var tipo_conexao = states[navigator.connection.type];
					
					if (tipo_conexao != 'No network connection') {
						isConnected = true;
					}
					
				}	
			}
			
			function onOnline() {
				isConnected = true;
			}
			function onOffline() {
				isConnected = false;
			}
			
			function ValidarNavegacao(){
				if (isPhoneGapReady){
					if (isConnected) {
						//Continuar
					} else {
						navigator.notification.alert('Não existe conexão com a Internet', alertDismissed, 'Jogo de Perguntas', 'OK');
						$.mobile.changePage("index.html");
					}				
				} else {
					navigator.notification.alert('O aplicativo não está pronto!', alertDismissed, 'Jogo de Perguntas', 'OK');
					$.mobile.changePage("index.html");
				}
			}
			
			//Funcoes do aplicativo
			function valButton(btn) {
				var cnt = -1;
				for (var i=btn.length-1; i > -1; i--) {
					if (btn[i].checked) {cnt = i; i = -1;}
				}
				if (cnt > -1) return btn[cnt].value;
				else return null;
			}
			
			function shuffleArray(array) {
				for (var i = array.length - 1; i > 0; i--) {
					var j = Math.floor(Math.random() * (i + 1));
					var temp = array[i];
					array[i] = array[j];
					array[j] = temp;
				}
				return array;
			}
			
			function ListarOpcoes(Pergunta){
				var tmp_opcao_contador = 1;
				var tmp_opcao_codigo = [];
				var tmp_opcao_descricao = [];
				$.ajax({
				type: "GET",
				url: "http://www.dbins.com.br/ferramentas/interior/xml/opcao_resposta.xml",
				dataType: "xml",
				success: function(data) {
					
					$(data).find('opcao_resposta').each(function(){
						
						var tmp_pergunta  = $(this).find("opr_pergunta").text();
						if (tmp_pergunta  == Pergunta) {
							var codigo = $(this).find("opr_cod").text();
							var opcao_resposta = $(this).find("opr_descricao").text();
							tmp_opcao_codigo.push(codigo);
							tmp_opcao_descricao.push(opcao_resposta);
						}
					});
					
					for (i = 0; i < 5; i++) {
						$('#opcao' + tmp_opcao_contador + '_rotulo').html(tmp_opcao_descricao[i]);
						$('#opcao' + tmp_opcao_contador).val(tmp_opcao_codigo[i]);
						tmp_opcao_contador++;
					}
					}
				});
			}
			
			
			function ValidarResposta(Resposta, Matriz){
				var retorno = "ERRO";
				for (w = 0; w < Matriz.length; w++) { 
					if (Math.abs(Resposta) == Math.abs(Matriz[w])) {
						retorno = "ACERTO";
					}
				}
				return retorno;
			}
			
			function DescricaoResposta(Resposta, Matriz){
				var retorno = "";
				for (w = 0; w < Matriz.length; w++) { 
					var conteudo = Matriz[w];
					var tmp_matriz = conteudo.split('*');
					if (Math.abs(Resposta) == Math.abs(tmp_matriz[0])) {
						retorno = tmp_matriz[1];
					}
				}
				return retorno;
			}
			
			
			
			//var perguntas = ["Pergunta1", "Pergunta2", "Pergunta3", "Pergunta4","Pergunta5"];
			var quantidade_acertos = 0;
			var codigo_pergunta = 0;
			var contador = 1;
			var perguntas = [];
			var opcoes_corretas = [];
			var opcoes_corretas_FULL = [];
			var opcoes_descricoes = [];
			var opcoes_descricoes_FULL = [];
			var tmp_respostas = [];
			var tmp_acertos = [];
			
			function apagar(){
				quantidade_acertos = 0;
				codigo_pergunta = 0;
				contador = 1;
				perguntas = [];
				opcoes_corretas = [];
				opcoes_corretas_FULL = [];
				opcoes_descricoes = [];
				opcoes_descricoes_FULL = [];
				tmp_respostas = [];
				tmp_acertos = [];
				$('#tabela_respostas').html('');
				$("#painel_perguntas").show();
				$("#secao_perguntas").show();
				$("#painel_respostas").hide();
			}
			
			
			$(document).on('pageshow', '#inicio', function(){
				if (isPhoneGapReady){
					if (isConnected) {
						$('#aviso_offline').hide();
						$('#btn_iniciar').show();
					} else {
						$('#aviso_offline').show();
						$('#btn_iniciar').hide();
					}
				} else {
					$('#aviso_offline').show();
					$('#btn_iniciar').hide();
				}
			});
			
			$(document).on('pageshow', '#tela1', function(){
				ValidarNavegacao();
				$.ajax({
				type: "GET",
				url: "http://www.dbins.com.br/ferramentas/interior/xml/perguntas.xml",
				dataType: "xml",
				success: function(data) {
					
						$(data).find('pergunta').each(function(){
							
							var codigo = $(this).find("per_cod").text();
							var pergunta = $(this).find("per_pergunta").text();
							
							var tmp_array = [codigo, pergunta];
							var tmp_conteudo = codigo + '*' + pergunta;
							perguntas.push(tmp_conteudo);
						});
						perguntas = shuffleArray(perguntas);
						var tmp_conteudo = perguntas[0];
						var tmp_matriz = tmp_conteudo.split('*');
						$('#pergunta').html('1 - ' + tmp_matriz[1]);
						codigo_pergunta = tmp_matriz[0];
						
						//Puxando as opcoes de respostas
						$.ajax({
						type: "GET",
						url: "http://www.dbins.com.br/ferramentas/interior/xml/opcao_resposta.xml",
						dataType: "xml",
						success: function(data) {
							
							$(data).find('opcao_resposta').each(function(){
								
								var codigo = $(this).find("opr_cod").text();
								var descricao = $(this).find("opr_descricao").text();
								var valida = $(this).find("opr_valida").text();
								var tmp_conteudo = codigo + '*' + descricao;
								if (Math.abs(valida)==1){
									opcoes_corretas.push(codigo);
								}
								opcoes_descricoes.push(tmp_conteudo);
							});
							opcoes_corretas_FULL = opcoes_corretas;
							opcoes_descricoes_FULL = opcoes_descricoes;
							opcoes_descricoes = shuffleArray(opcoes_descricoes);
							//Carga inicial do sistema
							ListarOpcoes(codigo_pergunta);
							},
							error: function(xhr, status, error) {
								//alert(status);
								//alert(xhr.responseText);
							 }
						});
						
						
					}
				});
				
				
				
				
				
				$('#btn_responder').click(function(){
					
					contador = $('#contador').val();
					//var tmp_contador = Math.abs(contador) - 1;
					var tmp_contador = Math.abs(contador);
					var tmp_resposta_atual = $('input:radio[name=opcao]:checked').val();
					
					if (tmp_resposta_atual != null){
						
						
						//Limpando todos os botoes
						$('input[name=opcao]').prop('checked', false);
						
						tmp_respostas.push(tmp_resposta_atual);
						//Validar se a resposta esta certa
						//tmp_acertos.push("ERRO");
						if (ValidarResposta(tmp_resposta_atual, opcoes_corretas_FULL)=="ACERTO"){
							quantidade_acertos++;	
						}
						
						//Incrementando o contador e mostrando a proxima pergunta
						contador++;
						var tmp_conteudo = perguntas[contador];
						var tmp_matriz = tmp_conteudo.split('*');
					
						$('#pergunta').html((Math.abs(contador)+ 1) + ' -  ' + tmp_matriz[1]);
						//Atualizado as opcoes
						codigo_pergunta = tmp_matriz[0];
						ListarOpcoes(codigo_pergunta);
						$('#contador').val(contador);
						if (contador == 5) {
							$('#pergunta').html('');
							//Exibir o resultado na mesma pagina
							
							//,Montando o painel de respostas
							var tmp_tabela;
							tmp_tabela = '<table data-role="table" data-mode="reflow" class="ui-responsive ui-shadow table-stripe">';
							tmp_tabela += '<thead><tr><td height="70" colspan="3" align="center" bgcolor="#FFFFFF"><strong>Voce acertou ' + quantidade_acertos + ' de 5</strong></td></tr>';
							tmp_tabela += '<tr>';
							tmp_tabela += '<td height="70" width="33%"  bgcolor="#000000"><strong><font color="#FFFFFF">Pergunta</font></strong></td>';
							tmp_tabela += '<td bgcolor="#000000"  width="33%"><strong><font color="#FFFFFF">Sua resposta</font></strong></td>';
							tmp_tabela += '<td bgcolor="#000000"  width="33%"><strong><font color="#FFFFFF">Resultado</font></strong></td>';
							tmp_tabela += '</tr></thead><tbody>';
							
							for (i = 0; i < 5; i++) {
								var tmp_conteudo1 = perguntas[i];
								var tmp_matriz1 = tmp_conteudo1.split('*');
								tmp_tabela += '<tr>';
								tmp_tabela += '<td height="70">' + tmp_matriz1[1]  +'</td>';
								tmp_tabela += '<td>' + DescricaoResposta(tmp_respostas[i], opcoes_descricoes_FULL) + '</td>';
								tmp_tabela += '<td>' + ValidarResposta(tmp_respostas[i], opcoes_corretas_FULL) + '</td>';
								tmp_tabela += '</tr>';
							}
							
							tmp_tabela += '</tbody></table>';
							$('#tabela_respostas').html(tmp_tabela);
							$("#painel_perguntas").hide();
							$("#secao_perguntas").hide();
							$("#painel_respostas").show();
							quantidade_acertos = 0;
						}
					} else {
						alert('Você nao selecionou nenhuma opcao!');
					}
				});
			 });
			 
			