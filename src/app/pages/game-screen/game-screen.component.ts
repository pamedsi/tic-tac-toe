import {Component} from '@angular/core';
import {GridComponent} from "../../components/grid/grid.component";
import {ScoreboardComponent} from "../../components/scoreboard/scoreboard.component";
import {MatchState} from "../../enums/MatchState";
import {Cell} from "../../types/Cell";
import {getEmptyGrid} from "../../../assets/assets";
import {MatchInfo} from "../../types/MatchInfo";
import {Player} from "../../types/Player";
import {NgIf} from "@angular/common";
import {SessionService} from "../../services/SessionService";
import {Router} from "@angular/router";
import {GameService} from "../../services/GameService";
import {GameStatus, GameStatusDTO} from "../../types/GameStatusDTO";

@Component({
  selector: 'app-game-screen',
  standalone: true,
  imports: [
    GridComponent,
    ScoreboardComponent,
    NgIf
  ],
  templateUrl: './game-screen.component.html',
  styleUrl: './game-screen.component.css'
})
export class GameScreenComponent {
  xScore: number = 0
  oScore: number = 0
  draws: number = 0
  moves: number = 0
  player!: Player
  gameStatus!: GameStatus
  grid: Cell[][] = getEmptyGrid()
  protected readonly GameState = MatchState

  constructor (
    private sessionService: SessionService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkSession()
    this.getStatus()
    this.gameService.listenToEvent().subscribe((data) => {
        // TODO
      }
    )
  }

  getStatus() {
    this.gameService.getStatus().subscribe(({
      next: ({status}: GameStatusDTO) => {
        this.gameStatus = status
      },
      error: (error: any) => {
        alert("Não foi possível obter o status da partida!")
        console.error(error)
      }
    }))
  }

  checkSession(): void {
    const sessionID = localStorage.getItem('id')
    if (sessionID) {
      this.sessionService.validateSession(sessionID).subscribe({
        next: (response) => {
          this.player = response.player;
        },
        error: (response) => {
          console.error(response)
          this.router.navigate([''])
        }
      })
    }
    else {
      this.router.navigate([''])
    }
  }

  startNewGame(): void {
    this.gameService.start().subscribe({
      next: () => {
        this.gameStatus = GameStatus.STARTED
        this.grid = getEmptyGrid()
      },
      error: (response) => {
        console.error(response.error.details)
        alert(response.error.details)
      }
    })
  }

  makeAMove() {
    this.moves++
    this.switchTurn()
  }

  switchTurn() {
    // TODO
    // this.turn === "X" ? this.turn = "O" : this.turn = "X"
  }

  score(matchInfo: MatchInfo): void {
    if(matchInfo.finished) {
      switch (matchInfo.winner) {
        case "X":
          this.xScore++
          break
        case "O":
          this.oScore++
          break
        default:
          this.draws++
      }
      this.finishMatch(matchInfo.winner)
    }
  }

  finishMatch(winner: string): void {
    const delay = 100
    this.gameStatus = GameStatus.FINISHED
    if (winner) {
      setTimeout(()=> {
        alert(`Jogador: "${winner}" venceu!`)
      }, delay)
    }
    else {
      setTimeout(()=> {
        alert(`Deu velha! Comece outro jogo!`)
      }, delay)
    }
  }

  protected readonly GameStatus = GameStatus;
}