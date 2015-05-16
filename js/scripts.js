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
				url: "res/opcao_resposta.xml",
				dataType: "xml",
				success: function(data) {
					alert('1');
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
			var codigo_pergunta = 612;
			var contador = 1;
			var perguntas = [];
			var opcoes_corretas = [];
			var opcoes_descricoes = [];
			var tmp_respostas = [];
			var tmp_acertos = [];
			
			
			
			$(document).on('pageshow', '#tela1', function(){
				alert('inicio perguntas');
				$.ajax({
				type: "GET",
				url: "res/perguntas.xml",
				dataType: "xml",
				success: function(data) {
					alert('3');
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
					$('#pergunta').html(tmp_matriz[1]);
					codigo_pergunta = tmp_matriz[0];
					}
				});
				//Puxando as opcoes de respostas
				$.ajax({
				type: "GET",
				url: "res/opcao_resposta.xml",
				dataType: "xml",
				success: function(data) {
					alert('5');
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
					opcoes_descricoes = shuffleArray(opcoes_descricoes);
					}
				});
				
				//Carga inicial do sistema
				ListarOpcoes(codigo_pergunta);
				
				$('#btn_responder').click(function(){
					alert('7');
					contador = $('#contador').val();
					var tmp_contador = Math.abs(contador) - 1;
					var tmp_resposta_atual = $('input:radio[name=opcao]:checked').val();
					
					if (tmp_resposta_atual !=""){
						alert('8');
						
						//Limpando todos os botoes
						$('input[name=opcao]').prop('checked', false);
						
						tmp_respostas.push(tmp_resposta_atual);
						//Validar se a resposta esta certa
						//tmp_acertos.push("ERRO");
						if (ValidarResposta(tmp_resposta_atual, opcoes_corretas)=="ACERTO"){
							quantidade_acertos++;	
						}
						
						//Incrementando o contador e mostrando a proxima pergunta
						contador++;
						var tmp_conteudo = perguntas[tmp_contador];
						var tmp_matriz = tmp_conteudo.split('*');
					
						$('#pergunta').html(contador + ' -  ' + tmp_matriz[1]);
						//Atualizado as opcoes
						codigo_pergunta = tmp_matriz[0];
						ListarOpcoes(codigo_pergunta);
						$('#contador').val(contador);
						if (contador == 6) {
							alert('9');
							//Exibir o resultado na mesma pagina
							alert(tmp_respostas);
							//,Montando o painel de respostas
							var tmp_tabela;
							tmp_tabela = '<table border="1">';
							tmp_tabela += '<tr><td colspan="3" align="center">Voce acertou ' + quantidade_acertos + ' de 5</td></tr>';
							tmp_tabela += '<tr>';
							tmp_tabela += '<td><strong>Pergunta</strong></td>';
							tmp_tabela += '<td><strong>Sua resposta</strong></td>';
							tmp_tabela += '<td><strong>Resultado</strong></td>';
							tmp_tabela += '</tr>';
							
							for (i = 0; i < 5; i++) {
								var tmp_conteudo = perguntas[i];
								var tmp_matriz = tmp_conteudo.split('*');
								tmp_tabela += '<tr>';
								tmp_tabela += '<td>' + tmp_matriz[1]  +'</td>';
								tmp_tabela += '<td>' + DescricaoResposta(tmp_respostas[i], opcoes_descricoes) + '</td>';
								tmp_tabela += '<td>' + ValidarResposta(tmp_respostas[i], opcoes_corretas) + '</td>';
								tmp_tabela += '</tr>';
							}
							
							tmp_tabela += '</table>';
							$('#tabela_respostas').html(tmp_tabela);
							$("#painel_perguntas").hide();
							$("#painel_respostas").show();
						}
					} else {
						alert('Você nao selecionou nenhuma opcao!');
					}
				});
			 });
			 
			